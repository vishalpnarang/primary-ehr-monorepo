package com.thinkitive.primus.encounter.service;

import com.thinkitive.primus.encounter.dto.*;
import com.thinkitive.primus.encounter.entity.*;
import com.thinkitive.primus.encounter.repository.*;
import com.thinkitive.primus.patient.entity.Patient;
import com.thinkitive.primus.patient.repository.PatientRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EncounterDetailServiceImpl implements EncounterDetailService {

    private final EncounterRepository encounterRepository;
    private final EncounterDiagnosisRepository encounterDiagnosisRepository;
    private final EncounterProcedureRepository encounterProcedureRepository;
    private final EncounterCommentRepository encounterCommentRepository;
    private final PatientVisitRepository patientVisitRepository;
    private final PatientRepository patientRepository;

    // ── Diagnoses ─────────────────────────────────────────────────────────────

    @Override
    public List<EncounterDiagnosisDto> getDiagnoses(String encounterUuid) {
        Long tenantId = TenantContext.getTenantId();
        Encounter encounter = requireEncounter(tenantId, encounterUuid);
        return encounterDiagnosisRepository
                .findByEncounterIdAndArchiveFalseOrderBySequenceAsc(encounter.getId())
                .stream()
                .map(d -> toDiagnosisDto(d, encounterUuid))
                .toList();
    }

    @Override
    @Transactional
    public EncounterDiagnosisDto addDiagnosis(String encounterUuid, AddDiagnosisRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Encounter encounter = requireEncounter(tenantId, encounterUuid);

        assertNotSigned(encounter, "diagnoses");

        if (encounterDiagnosisRepository.existsByEncounterIdAndIcd10CodeAndArchiveFalse(
                encounter.getId(), request.getIcd10Code())) {
            throw new PrimusException(ResponseCode.CONFLICT,
                    "ICD-10 code already on encounter: " + request.getIcd10Code());
        }

        EncounterDiagnosis diagnosis = EncounterDiagnosis.builder()
                .tenantId(tenantId)
                .encounterId(encounter.getId())
                .icd10Code(request.getIcd10Code())
                .description(request.getDescription())
                .isPrimary(request.isPrimary())
                .sequence(request.getSequence())
                .build();

        EncounterDiagnosis saved = encounterDiagnosisRepository.save(diagnosis);
        log.info("Diagnosis added encounter={} code={}", encounterUuid, request.getIcd10Code());
        return toDiagnosisDto(saved, encounterUuid);
    }

    @Override
    @Transactional
    public void removeDiagnosis(String encounterUuid, String diagnosisUuid) {
        Long tenantId = TenantContext.getTenantId();
        Encounter encounter = requireEncounter(tenantId, encounterUuid);
        assertNotSigned(encounter, "diagnoses");

        EncounterDiagnosis diagnosis = encounterDiagnosisRepository
                .findByTenantIdAndUuid(tenantId, diagnosisUuid)
                .filter(d -> d.getEncounterId().equals(encounter.getId()))
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Diagnosis not found: " + diagnosisUuid));

        diagnosis.setArchive(true);
        encounterDiagnosisRepository.save(diagnosis);
        log.info("Diagnosis removed uuid={} from encounter={}", diagnosisUuid, encounterUuid);
    }

    // ── Procedures ────────────────────────────────────────────────────────────

    @Override
    public List<EncounterProcedureDto> getProcedures(String encounterUuid) {
        Long tenantId = TenantContext.getTenantId();
        Encounter encounter = requireEncounter(tenantId, encounterUuid);
        return encounterProcedureRepository
                .findByEncounterIdAndArchiveFalse(encounter.getId())
                .stream()
                .map(p -> toProcedureDto(p, encounterUuid))
                .toList();
    }

    @Override
    @Transactional
    public EncounterProcedureDto addProcedure(String encounterUuid, AddProcedureRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Encounter encounter = requireEncounter(tenantId, encounterUuid);
        assertNotSigned(encounter, "procedures");

        EncounterProcedure procedure = EncounterProcedure.builder()
                .tenantId(tenantId)
                .encounterId(encounter.getId())
                .cptCode(request.getCptCode())
                .description(request.getDescription())
                .modifier(request.getModifier())
                .units(request.getUnits() != null ? request.getUnits() : 1)
                .build();

        EncounterProcedure saved = encounterProcedureRepository.save(procedure);
        log.info("Procedure added encounter={} cpt={}", encounterUuid, request.getCptCode());
        return toProcedureDto(saved, encounterUuid);
    }

    // ── Comments ──────────────────────────────────────────────────────────────

    @Override
    public List<EncounterCommentDto> getComments(String encounterUuid) {
        Long tenantId = TenantContext.getTenantId();
        Encounter encounter = requireEncounter(tenantId, encounterUuid);
        return encounterCommentRepository
                .findByEncounterIdAndArchiveFalseOrderByCreatedAtAsc(encounter.getId())
                .stream()
                .map(c -> toCommentDto(c, encounterUuid))
                .toList();
    }

    @Override
    @Transactional
    public EncounterCommentDto addComment(String encounterUuid, AddCommentRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Encounter encounter = requireEncounter(tenantId, encounterUuid);

        EncounterComment comment = EncounterComment.builder()
                .tenantId(tenantId)
                .encounterId(encounter.getId())
                .userId(currentUserId())
                .comment(request.getComment())
                .build();

        EncounterComment saved = encounterCommentRepository.save(comment);
        log.info("Comment added to encounter={} by user={}", encounterUuid, saved.getUserId());
        return toCommentDto(saved, encounterUuid);
    }

    // ── Visit Tracking ────────────────────────────────────────────────────────

    @Override
    public PatientVisitDto getVisitByEncounter(String encounterUuid) {
        Long tenantId = TenantContext.getTenantId();
        Encounter encounter = requireEncounter(tenantId, encounterUuid);
        PatientVisit visit = patientVisitRepository
                .findByEncounterIdAndTenantIdAndArchiveFalse(encounter.getId(), tenantId)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "No visit record found for encounter: " + encounterUuid));
        return toVisitDto(visit, encounterUuid);
    }

    @Override
    @Transactional
    public PatientVisitDto createVisit(String encounterUuid, CreateVisitRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Encounter encounter = requireEncounter(tenantId, encounterUuid);

        Patient patient = patientRepository.findByTenantIdAndUuid(tenantId, request.getPatientUuid())
                .orElseThrow(() -> new PrimusException(ResponseCode.PATIENT_NOT_FOUND,
                        "Patient not found: " + request.getPatientUuid()));

        PatientVisit visit = PatientVisit.builder()
                .tenantId(tenantId)
                .patientId(patient.getId())
                .encounterId(encounter.getId())
                .checkInTime(request.getCheckInTime() != null ? request.getCheckInTime() : Instant.now())
                .status(PatientVisit.VisitStatus.CHECKED_IN)
                .build();

        PatientVisit saved = patientVisitRepository.save(visit);
        log.info("Visit created uuid={} encounter={}", saved.getUuid(), encounterUuid);
        return toVisitDto(saved, encounterUuid);
    }

    @Override
    @Transactional
    public PatientVisitDto updateVisitStatus(String encounterUuid, UpdateVisitStatusRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Encounter encounter = requireEncounter(tenantId, encounterUuid);

        PatientVisit visit = patientVisitRepository
                .findByEncounterIdAndTenantIdAndArchiveFalse(encounter.getId(), tenantId)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "No visit record found for encounter: " + encounterUuid));

        PatientVisit.VisitStatus status = parseVisitStatus(request.getStatus());
        Instant ts = request.getTimestamp() != null ? request.getTimestamp() : Instant.now();

        visit.setStatus(status);
        switch (status) {
            case ROOMED           -> visit.setRoomingTime(ts);
            case WITH_PROVIDER    -> visit.setProviderStartTime(ts);
            case CHECKOUT, COMPLETED -> visit.setCheckoutTime(ts);
            default               -> { /* CHECKED_IN / CANCELLED — no extra timestamp */ }
        }

        PatientVisit saved = patientVisitRepository.save(visit);
        log.info("Visit status updated encounter={} status={}", encounterUuid, status);
        return toVisitDto(saved, encounterUuid);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Encounter requireEncounter(Long tenantId, String uuid) {
        return encounterRepository.findByTenantIdAndUuid(tenantId, uuid)
                .filter(e -> !e.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Encounter not found: " + uuid));
    }

    private void assertNotSigned(Encounter encounter, String target) {
        if (encounter.getStatus() == Encounter.EncounterStatus.SIGNED) {
            throw new PrimusException(ResponseCode.ENCOUNTER_LOCKED,
                    "Cannot modify " + target + " on a signed encounter.");
        }
    }

    private PatientVisit.VisitStatus parseVisitStatus(String value) {
        try {
            return PatientVisit.VisitStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Unknown visit status: " + value);
        }
    }

    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return "system";
    }

    private EncounterDiagnosisDto toDiagnosisDto(EncounterDiagnosis d, String encounterUuid) {
        return EncounterDiagnosisDto.builder()
                .uuid(d.getUuid())
                .encounterUuid(encounterUuid)
                .icd10Code(d.getIcd10Code())
                .description(d.getDescription())
                .isPrimary(d.isPrimary())
                .sequence(d.getSequence())
                .createdAt(d.getCreatedAt())
                .modifiedAt(d.getModifiedAt())
                .build();
    }

    private EncounterProcedureDto toProcedureDto(EncounterProcedure p, String encounterUuid) {
        return EncounterProcedureDto.builder()
                .uuid(p.getUuid())
                .encounterUuid(encounterUuid)
                .cptCode(p.getCptCode())
                .description(p.getDescription())
                .modifier(p.getModifier())
                .units(p.getUnits())
                .createdAt(p.getCreatedAt())
                .modifiedAt(p.getModifiedAt())
                .build();
    }

    private EncounterCommentDto toCommentDto(EncounterComment c, String encounterUuid) {
        return EncounterCommentDto.builder()
                .uuid(c.getUuid())
                .encounterUuid(encounterUuid)
                .userId(c.getUserId())
                .comment(c.getComment())
                .createdAt(c.getCreatedAt())
                .modifiedAt(c.getModifiedAt())
                .build();
    }

    private PatientVisitDto toVisitDto(PatientVisit v, String encounterUuid) {
        return PatientVisitDto.builder()
                .uuid(v.getUuid())
                .encounterUuid(encounterUuid)
                .checkInTime(v.getCheckInTime())
                .roomingTime(v.getRoomingTime())
                .providerStartTime(v.getProviderStartTime())
                .checkoutTime(v.getCheckoutTime())
                .status(v.getStatus() != null ? v.getStatus().name() : null)
                .createdAt(v.getCreatedAt())
                .modifiedAt(v.getModifiedAt())
                .build();
    }
}
