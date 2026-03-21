package com.thinkitive.primus.encounter.service;

import com.thinkitive.primus.encounter.dto.*;
import com.thinkitive.primus.encounter.entity.AssessmentPlan;
import com.thinkitive.primus.encounter.entity.Encounter;
import com.thinkitive.primus.encounter.entity.Encounter.EncounterStatus;
import com.thinkitive.primus.encounter.entity.Encounter.EncounterType;
import com.thinkitive.primus.encounter.repository.AssessmentPlanRepository;
import com.thinkitive.primus.encounter.repository.EncounterRepository;
import com.thinkitive.primus.patient.entity.Patient;
import com.thinkitive.primus.patient.repository.PatientRepository;
import com.thinkitive.primus.scheduling.entity.Appointment;
import com.thinkitive.primus.scheduling.repository.AppointmentRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EncounterServiceImpl implements EncounterService {

    private final EncounterRepository encounterRepository;
    private final AssessmentPlanRepository assessmentPlanRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    // ── Write operations ──────────────────────────────────────────────────────

    @Override
    @Transactional
    public EncounterDto createEncounter(CreateEncounterRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating encounter tenant={} patient={}", tenantId, request.getPatientUuid());

        Patient patient = patientRepository.findByTenantIdAndUuid(tenantId, request.getPatientUuid())
                .orElseThrow(() -> new PrimusException(ResponseCode.PATIENT_NOT_FOUND,
                        "Patient not found: " + request.getPatientUuid()));

        // Resolve appointment when provided — inherits provider and encounter date.
        // Phase 2: add findByTenantIdAndUuid to AppointmentRepository to replace this scan.
        Appointment appointment = null;
        if (request.getAppointmentUuid() != null) {
            appointment = appointmentRepository
                    .findByTenantIdAndPatientId(tenantId, patient.getId())
                    .stream()
                    .filter(a -> a.getUuid().equals(request.getAppointmentUuid()))
                    .findFirst()
                    .orElse(null);
        }

        Long providerId = resolveProviderId(request.getProviderId(), appointment);
        EncounterType type = parseEncounterType(request.getEncounterType());
        LocalDate encounterDate = (appointment != null) ? appointment.getDate() : LocalDate.now();

        Encounter encounter = Encounter.builder()
                .tenantId(tenantId)
                .patientId(patient.getId())
                .providerId(providerId)
                .appointmentId(appointment != null ? appointment.getId() : null)
                .date(encounterDate)
                .type(type)
                .status(EncounterStatus.DRAFT)
                .chiefComplaint(request.getChiefComplaint())
                .build();

        Encounter saved = encounterRepository.save(encounter);
        log.info("Encounter created id={} uuid={} status=DRAFT", saved.getId(), saved.getUuid());

        return toDto(saved, patient, List.of());
    }

    @Override
    @Transactional
    public EncounterDto updateEncounter(String uuid, UpdateEncounterRequest request) {
        Long tenantId = TenantContext.getTenantId();

        Encounter encounter = requireEncounter(tenantId, uuid);

        if (encounter.getStatus() == EncounterStatus.SIGNED) {
            throw new PrimusException(ResponseCode.ENCOUNTER_LOCKED,
                    "Encounter is signed and cannot be modified. Use addendum.");
        }

        // Apply partial updates — only non-null fields
        if (request.getChiefComplaint() != null) encounter.setChiefComplaint(request.getChiefComplaint());
        if (request.getSubjective()     != null) encounter.setHpiText(request.getSubjective());
        if (request.getObjective()      != null) encounter.setExamination(request.getObjective());
        if (request.getEncounterType()  != null) encounter.setType(parseEncounterType(request.getEncounterType()));

        // Status promotion: DRAFT → IN_PROGRESS on first edit
        if (encounter.getStatus() == EncounterStatus.DRAFT) {
            encounter.setStatus(EncounterStatus.IN_PROGRESS);
        }

        // Replace assessment plan items when diagnosis codes are provided
        if (request.getDiagnosisCodes() != null && !request.getDiagnosisCodes().isEmpty()) {
            assessmentPlanRepository.deleteByEncounterId(encounter.getId());
            List<AssessmentPlan> plans = buildAssessmentPlans(
                    encounter.getId(), tenantId,
                    request.getDiagnosisCodes(),
                    request.getAssessment(),
                    request.getPlan()
            );
            assessmentPlanRepository.saveAll(plans);
        }

        Encounter saved = encounterRepository.save(encounter);
        Patient patient = requirePatient(saved.getPatientId());
        List<AssessmentPlan> plans = assessmentPlanRepository.findByEncounterIdOrderBySortOrder(saved.getId());

        log.info("Encounter updated uuid={} status={}", uuid, saved.getStatus());
        return toDto(saved, patient, plans);
    }

    @Override
    @Transactional
    public EncounterDto signEncounter(String uuid) {
        Long tenantId = TenantContext.getTenantId();

        Encounter encounter = requireEncounter(tenantId, uuid);

        if (encounter.getStatus() == EncounterStatus.SIGNED) {
            throw new PrimusException(ResponseCode.ENCOUNTER_LOCKED, "Encounter is already signed.");
        }

        encounter.setStatus(EncounterStatus.SIGNED);
        encounter.setSignedAt(Instant.now());
        encounter.setSignedBy(currentAuditor());

        Encounter saved = encounterRepository.save(encounter);
        Patient patient = requirePatient(saved.getPatientId());
        List<AssessmentPlan> plans = assessmentPlanRepository.findByEncounterIdOrderBySortOrder(saved.getId());

        // Phase 6: trigger charge/claim generation via BillingService
        log.info("Encounter signed uuid={} signedBy={} — charge generation deferred to Phase 6",
                uuid, saved.getSignedBy());

        return toDto(saved, patient, plans);
    }

    @Override
    @Transactional
    public EncounterDto addAddendum(String uuid, AddendumRequest request) {
        Long tenantId = TenantContext.getTenantId();

        Encounter original = requireEncounter(tenantId, uuid);

        if (original.getStatus() != EncounterStatus.SIGNED) {
            throw new PrimusException(ResponseCode.BAD_REQUEST,
                    "Addenda can only be added to signed encounters.");
        }

        // Creates a new Encounter row with status ADDENDUM, linked to the original via
        // chiefComplaint prefix convention. Phase 3: add a parentEncounterId FK column to
        // Encounter to express this relationship formally.
        Encounter addendum = Encounter.builder()
                .tenantId(tenantId)
                .patientId(original.getPatientId())
                .providerId(original.getProviderId())
                .appointmentId(original.getAppointmentId())
                .date(LocalDate.now())
                .type(original.getType())
                .status(EncounterStatus.ADDENDUM)
                .chiefComplaint("ADDENDUM to encounter " + original.getUuid() + ": " + request.getText())
                .hpiText(request.getText())
                .signedAt(Instant.now())
                .signedBy(currentAuditor())
                .build();

        Encounter saved = encounterRepository.save(addendum);
        Patient patient = requirePatient(saved.getPatientId());

        log.info("Addendum created uuid={} for original encounter uuid={}", saved.getUuid(), uuid);
        return toDto(saved, patient, List.of());
    }

    // ── Read operations ───────────────────────────────────────────────────────

    @Override
    public EncounterDto getEncounter(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        Encounter encounter = requireEncounter(tenantId, uuid);
        Patient patient = requirePatient(encounter.getPatientId());
        List<AssessmentPlan> plans = assessmentPlanRepository.findByEncounterIdOrderBySortOrder(encounter.getId());
        return toDto(encounter, patient, plans);
    }

    @Override
    public List<EncounterDto> getEncountersByPatient(String patientUuid) {
        Long tenantId = TenantContext.getTenantId();
        Patient patient = patientRepository.findByTenantIdAndUuid(tenantId, patientUuid)
                .orElseThrow(() -> new PrimusException(ResponseCode.PATIENT_NOT_FOUND,
                        "Patient not found: " + patientUuid));

        return encounterRepository
                .findByTenantIdAndPatientIdOrderByDateDesc(
                        tenantId, patient.getId(),
                        PageRequest.of(0, 200, Sort.by(Sort.Direction.DESC, "date")))
                .getContent()
                .stream()
                .filter(e -> !e.isArchive())
                .map(e -> {
                    List<AssessmentPlan> plans =
                            assessmentPlanRepository.findByEncounterIdOrderBySortOrder(e.getId());
                    return toDto(e, patient, plans);
                })
                .toList();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Encounter requireEncounter(Long tenantId, String uuid) {
        return encounterRepository.findByTenantIdAndUuid(tenantId, uuid)
                .filter(e -> !e.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Encounter not found: " + uuid));
    }

    private Patient requirePatient(Long patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new PrimusException(ResponseCode.PATIENT_NOT_FOUND,
                        "Patient record not found for id: " + patientId));
    }

    /** Parse encounter type string to enum, defaulting to OFFICE_VISIT on unknown values. */
    private EncounterType parseEncounterType(String type) {
        if (type == null) return EncounterType.OFFICE_VISIT;
        try {
            return EncounterType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown encounter type '{}', defaulting to OFFICE_VISIT", type);
            return EncounterType.OFFICE_VISIT;
        }
    }

    /**
     * Resolve a Long provider ID from the linked appointment (preferred) or the request string.
     * Phase 1: replace with ProviderRepository.findByTenantIdAndUuid lookup once the provider
     * domain entity and repository exist.
     */
    private Long resolveProviderId(String providerIdStr, Appointment appointment) {
        if (appointment != null) {
            return appointment.getProviderId();
        }
        // Parse numeric suffix from "PRV-XXXXX" format as a temporary bridge
        if (providerIdStr != null) {
            String digits = providerIdStr.replaceAll("\\D+", "");
            if (!digits.isEmpty()) {
                try {
                    return Long.parseLong(digits);
                } catch (NumberFormatException e) {
                    log.warn("Could not parse provider id from '{}': {}", providerIdStr, e.getMessage());
                }
            }
        }
        // Phase 1: resolve from authenticated JWT sub/provider claim
        return 0L;
    }

    /** Build one AssessmentPlan row per ICD-10 code. */
    private List<AssessmentPlan> buildAssessmentPlans(
            Long encounterId,
            Long tenantId,
            List<String> diagnosisCodes,
            String assessmentText,
            String planText) {
        List<AssessmentPlan> result = new ArrayList<>();
        for (int i = 0; i < diagnosisCodes.size(); i++) {
            result.add(AssessmentPlan.builder()
                    .tenantId(tenantId)
                    .encounterId(encounterId)
                    .icdCode(diagnosisCodes.get(i))
                    .diagnosis(assessmentText != null ? assessmentText : diagnosisCodes.get(i))
                    .plan(planText)
                    .sortOrder(i)
                    .build());
        }
        return result;
    }

    private String currentAuditor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return "system";
    }

    // ── DTO mapping ───────────────────────────────────────────────────────────

    private EncounterDto toDto(Encounter e, Patient patient, List<AssessmentPlan> plans) {
        List<String> diagnosisCodes = plans.stream()
                .map(AssessmentPlan::getIcdCode)
                .toList();

        String assessment = plans.stream()
                .map(p -> p.getIcdCode() + " — " + p.getDiagnosis())
                .reduce((a, b) -> a + "\n" + b)
                .orElse(null);

        String plan = plans.stream()
                .map(AssessmentPlan::getPlan)
                .filter(p -> p != null && !p.isBlank())
                .reduce((a, b) -> a + "\n" + b)
                .orElse(null);

        // Fetch addenda: ADDENDUM-status encounters that reference this encounter's UUID
        // in their chiefComplaint prefix. Phase 3: replace with parentEncounterId FK query.
        List<AddendumDto> addendaDtos = encounterRepository
                .findByTenantIdAndPatientIdAndDateBetween(
                        e.getTenantId(), e.getPatientId(),
                        LocalDate.of(2000, 1, 1), LocalDate.of(2099, 12, 31))
                .stream()
                .filter(a -> a.getStatus() == EncounterStatus.ADDENDUM
                        && !a.getId().equals(e.getId())
                        && a.getChiefComplaint() != null
                        && a.getChiefComplaint().startsWith("ADDENDUM to encounter " + e.getUuid()))
                .map(a -> AddendumDto.builder()
                        .uuid(a.getUuid())
                        .encounterUuid(e.getUuid())
                        .text(a.getHpiText())
                        .addedBy(a.getSignedBy())
                        .addedAt(a.getSignedAt())
                        .build())
                .toList();

        return EncounterDto.builder()
                .uuid(e.getUuid())
                .patientUuid(patient.getUuid())
                .patientName(patient.getFirstName() + " " + patient.getLastName())
                .encounterType(e.getType() != null ? e.getType().name() : null)
                .status(e.getStatus() != null ? e.getStatus().name() : null)
                .chiefComplaint(e.getChiefComplaint())
                .subjective(e.getHpiText())
                .objective(e.getExamination())
                .assessment(assessment)
                .plan(plan)
                .diagnosisCodes(diagnosisCodes)
                .signedAt(e.getSignedAt())
                .signedBy(e.getSignedBy())
                .createdAt(e.getCreatedAt())
                .modifiedAt(e.getModifiedAt())
                .addenda(addendaDtos)
                .build();
    }
}
