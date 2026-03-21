package com.thinkitive.primus.patient.service;

import com.thinkitive.primus.encounter.entity.Encounter;
import com.thinkitive.primus.encounter.repository.EncounterRepository;
import com.thinkitive.primus.patient.dto.*;
import com.thinkitive.primus.patient.entity.Allergy;
import com.thinkitive.primus.patient.entity.Patient;
import com.thinkitive.primus.patient.entity.Problem;
import com.thinkitive.primus.patient.entity.VitalSigns;
import com.thinkitive.primus.patient.repository.AllergyRepository;
import com.thinkitive.primus.patient.repository.PatientRepository;
import com.thinkitive.primus.patient.repository.ProblemRepository;
import com.thinkitive.primus.patient.repository.VitalSignsRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final AllergyRepository allergyRepository;
    private final ProblemRepository problemRepository;
    private final VitalSignsRepository vitalSignsRepository;
    private final EncounterRepository encounterRepository;

    @PersistenceContext
    private EntityManager entityManager;

    // ── Create ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public PatientDto createPatient(CreatePatientRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating patient for tenant={} name={} {}", tenantId, request.getFirstName(), request.getLastName());

        String mrn = generateMrn(tenantId);

        Patient patient = Patient.builder()
                .tenantId(tenantId)
                .mrn(mrn)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .preferredName(request.getMiddleName())
                .dob(request.getDateOfBirth())
                .sex(request.getSex())
                .gender(request.getGenderIdentity())
                .phone(request.getPhone())
                .email(request.getEmail())
                .addressLine1(request.getAddressLine1())
                .city(request.getCity())
                .state(request.getState())
                .zip(request.getZip())
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactPhone(request.getEmergencyContactPhone())
                .emergencyContactRelation(request.getEmergencyContactRelationship())
                .status(Patient.PatientStatus.ACTIVE)
                .build();

        Patient saved = patientRepository.save(patient);
        log.info("Patient created: uuid={} mrn={}", saved.getUuid(), saved.getMrn());
        return toDto(saved);
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    @Override
    public PatientDto getPatient(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        Patient patient = findPatientOrThrow(uuid, tenantId);
        return toDto(patient);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public PatientDto updatePatient(String uuid, UpdatePatientRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Updating patient uuid={} tenant={}", uuid, tenantId);

        Patient patient = findPatientOrThrow(uuid, tenantId);
        applyUpdates(patient, request);
        Patient saved = patientRepository.save(patient);
        return toDto(saved);
    }

    // ── Delete (soft) ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deletePatient(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Soft-deleting patient uuid={} tenant={}", uuid, tenantId);

        Patient patient = findPatientOrThrow(uuid, tenantId);
        patient.setArchive(true);
        patientRepository.save(patient);
    }

    // ── List / Search ─────────────────────────────────────────────────────────

    @Override
    public Page<PatientDto> listPatients(Pageable pageable) {
        Long tenantId = TenantContext.getTenantId();
        return patientRepository.findByTenantIdAndArchiveFalse(tenantId, pageable)
                .map(this::toDto);
    }

    @Override
    public Page<PatientSearchResult> searchPatients(String query, Pageable pageable) {
        Long tenantId = TenantContext.getTenantId();
        return patientRepository.searchByName(tenantId, query, pageable)
                .map(this::toSearchResult);
    }

    // ── Clinical sub-resources ────────────────────────────────────────────────

    @Override
    @Transactional
    public AllergyDto addAllergy(String patientUuid, AllergyRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Patient patient = findPatientOrThrow(patientUuid, tenantId);

        Allergy.AllergySeverity severity = parseSeverity(request.getSeverity());

        Allergy allergy = Allergy.builder()
                .tenantId(tenantId)
                .patientId(patient.getId())
                .substance(request.getAllergen())
                .reaction(request.getReaction())
                .severity(severity)
                .type(Allergy.AllergyType.DRUG) // default; extend request to carry type if needed
                .build();

        Allergy saved = allergyRepository.save(allergy);
        log.info("Allergy saved id={} patient={}", saved.getId(), patientUuid);

        return AllergyDto.builder()
                .uuid(saved.getUuid())
                .patientUuid(patient.getUuid())
                .allergen(saved.getSubstance())
                .reaction(saved.getReaction())
                .severity(saved.getSeverity().name())
                .recordedAt(saved.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public ProblemDto addProblem(String patientUuid, ProblemRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Patient patient = findPatientOrThrow(patientUuid, tenantId);

        Problem.ProblemStatus status = parseProblemStatus(request.getStatus());

        Problem problem = Problem.builder()
                .tenantId(tenantId)
                .patientId(patient.getId())
                .icdCode(request.getIcd10Code())
                .description(request.getDescription())
                .status(status)
                .addedAt(Instant.now())
                .build();

        Problem saved = problemRepository.save(problem);
        log.info("Problem saved id={} patient={}", saved.getId(), patientUuid);

        return ProblemDto.builder()
                .uuid(saved.getUuid())
                .patientUuid(patient.getUuid())
                .icd10Code(saved.getIcdCode())
                .description(saved.getDescription())
                .status(saved.getStatus().name())
                .recordedAt(saved.getAddedAt())
                .build();
    }

    @Override
    @Transactional
    public VitalsDto recordVitals(String patientUuid, VitalsRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Patient patient = findPatientOrThrow(patientUuid, tenantId);

        Integer systolic  = parseIntOrNull(request.getBloodPressureSystolic());
        Integer diastolic = parseIntOrNull(request.getBloodPressureDiastolic());

        BigDecimal weight      = request.getWeightLbs()              != null ? BigDecimal.valueOf(request.getWeightLbs())              : null;
        BigDecimal height      = request.getHeightInches()           != null ? BigDecimal.valueOf(request.getHeightInches())           : null;
        BigDecimal temperature = request.getTemperatureFahrenheit()  != null ? BigDecimal.valueOf(request.getTemperatureFahrenheit())  : null;
        Integer    o2Sat       = request.getOxygenSaturationPercent() != null ? request.getOxygenSaturationPercent().intValue()               : null;
        BigDecimal bmi         = request.getBmiCalculated()          != null ? BigDecimal.valueOf(request.getBmiCalculated())          : null;

        VitalSigns vitals = VitalSigns.builder()
                .tenantId(tenantId)
                .patientId(patient.getId())
                .systolic(systolic)
                .diastolic(diastolic)
                .heartRate(request.getHeartRateBpm())
                .respiratoryRate(request.getRespiratoryRateBpm())
                .temperature(temperature)
                .o2Saturation(o2Sat)
                .weight(weight)
                .height(height)
                .bmi(bmi)
                .recordedAt(request.getRecordedAt())
                .build();

        VitalSigns saved = vitalSignsRepository.save(vitals);
        log.info("Vitals saved id={} patient={}", saved.getId(), patientUuid);

        String bp = (systolic != null && diastolic != null) ? systolic + "/" + diastolic : null;

        return VitalsDto.builder()
                .uuid(saved.getUuid())
                .patientUuid(patient.getUuid())
                .recordedAt(saved.getRecordedAt())
                .weightLbs(request.getWeightLbs())
                .heightInches(request.getHeightInches())
                .bmiCalculated(request.getBmiCalculated())
                .bloodPressure(bp)
                .heartRateBpm(saved.getHeartRate())
                .respiratoryRateBpm(saved.getRespiratoryRate())
                .temperatureFahrenheit(request.getTemperatureFahrenheit())
                .oxygenSaturationPercent(request.getOxygenSaturationPercent())
                .bloodGlucoseMgDl(request.getBloodGlucoseMgDl())
                .glucoseTiming(request.getGlucoseTiming())
                .build();
    }

    // ── Timeline ──────────────────────────────────────────────────────────────

    @Override
    public List<TimelineEventDto> getTimeline(String patientUuid) {
        Long tenantId = TenantContext.getTenantId();
        Patient patient = findPatientOrThrow(patientUuid, tenantId);
        Long patientId  = patient.getId();

        List<TimelineEventDto> timeline = new ArrayList<>();
        timeline.addAll(encounterEvents(tenantId, patientId));
        timeline.addAll(allergyEvents(patientId));
        timeline.addAll(problemEvents(patientId));
        vitalsEvent(patientId).ifPresent(timeline::add);
        timeline.sort(java.util.Comparator.comparing(
                TimelineEventDto::getOccurredAt,
                java.util.Comparator.nullsLast(java.util.Comparator.reverseOrder())));
        return timeline;
    }

    // ── Update field applicator ───────────────────────────────────────────────

    private void applyUpdates(Patient patient, UpdatePatientRequest r) {
        applyDemographics(patient, r);
        applyAddress(patient, r);
        applyEmergencyContact(patient, r);
    }

    private void applyDemographics(Patient patient, UpdatePatientRequest r) {
        if (r.getFirstName()      != null) patient.setFirstName(r.getFirstName());
        if (r.getLastName()       != null) patient.setLastName(r.getLastName());
        if (r.getMiddleName()     != null) patient.setPreferredName(r.getMiddleName());
        if (r.getDateOfBirth()    != null) patient.setDob(r.getDateOfBirth());
        if (r.getSex()            != null) patient.setSex(r.getSex());
        if (r.getGenderIdentity() != null) patient.setGender(r.getGenderIdentity());
        if (r.getPhone()          != null) patient.setPhone(r.getPhone());
        if (r.getEmail()          != null) patient.setEmail(r.getEmail());
    }

    private void applyAddress(Patient patient, UpdatePatientRequest r) {
        if (r.getAddressLine1() != null) patient.setAddressLine1(r.getAddressLine1());
        if (r.getAddressLine2() != null) patient.setAddressLine2(r.getAddressLine2());
        if (r.getCity()         != null) patient.setCity(r.getCity());
        if (r.getState()        != null) patient.setState(r.getState());
        if (r.getZip()          != null) patient.setZip(r.getZip());
    }

    private void applyEmergencyContact(Patient patient, UpdatePatientRequest r) {
        if (r.getEmergencyContactName()         != null) patient.setEmergencyContactName(r.getEmergencyContactName());
        if (r.getEmergencyContactPhone()        != null) patient.setEmergencyContactPhone(r.getEmergencyContactPhone());
        if (r.getEmergencyContactRelationship() != null) patient.setEmergencyContactRelation(r.getEmergencyContactRelationship());
    }

    // ── Timeline helpers ──────────────────────────────────────────────────────

    private List<TimelineEventDto> encounterEvents(Long tenantId, Long patientId) {
        return encounterRepository
                .findByTenantIdAndPatientIdOrderByDateDesc(tenantId, patientId, Pageable.ofSize(20))
                .getContent()
                .stream()
                .map(enc -> TimelineEventDto.builder()
                        .uuid(enc.getUuid())
                        .eventType("ENCOUNTER")
                        .title(enc.getType().name().replace('_', ' '))
                        .summary(enc.getChiefComplaint())
                        .occurredAt(enc.getDate() != null
                                ? enc.getDate().atStartOfDay(java.time.ZoneOffset.UTC).toInstant()
                                : enc.getCreatedAt())
                        .referenceUuid(enc.getUuid() != null ? enc.getUuid().toString() : null)
                        .build())
                .toList();
    }

    private List<TimelineEventDto> allergyEvents(Long patientId) {
        return allergyRepository.findByPatientIdAndArchiveFalse(patientId)
                .stream()
                .map(a -> TimelineEventDto.builder()
                        .uuid(a.getUuid())
                        .eventType("ALLERGY")
                        .title("Allergy: " + a.getSubstance())
                        .summary(a.getReaction() + " — " + a.getSeverity().name())
                        .occurredAt(a.getCreatedAt())
                        .referenceUuid(a.getUuid() != null ? a.getUuid().toString() : null)
                        .build())
                .toList();
    }

    private List<TimelineEventDto> problemEvents(Long patientId) {
        return problemRepository.findByPatientIdAndArchiveFalse(patientId)
                .stream()
                .map(p -> TimelineEventDto.builder()
                        .uuid(p.getUuid())
                        .eventType("PROBLEM")
                        .title(p.getDescription())
                        .summary(p.getIcdCode() + " — " + p.getStatus().name())
                        .occurredAt(p.getAddedAt() != null ? p.getAddedAt() : p.getCreatedAt())
                        .referenceUuid(p.getUuid() != null ? p.getUuid().toString() : null)
                        .build())
                .toList();
    }

    private java.util.Optional<TimelineEventDto> vitalsEvent(Long patientId) {
        return vitalSignsRepository.findTopByPatientIdOrderByRecordedAtDesc(patientId)
                .map(v -> {
                    String bp = (v.getSystolic() != null && v.getDiastolic() != null)
                            ? v.getSystolic() + "/" + v.getDiastolic() : "—";
                    return TimelineEventDto.builder()
                            .uuid(v.getUuid())
                            .eventType("VITALS")
                            .title("Vitals recorded")
                            .summary("BP: " + bp + "  HR: " + v.getHeartRate() + "  O2: " + v.getO2Saturation() + "%")
                            .occurredAt(v.getRecordedAt())
                            .referenceUuid(v.getUuid() != null ? v.getUuid().toString() : null)
                            .build();
                });
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Generates a unique MRN for the tenant using a native MAX query so it is
     * safe without a DB sequence object.  Format: PAT-XXXXX (5 digits, min 10001).
     */
    private String generateMrn(Long tenantId) {
        Number max = (Number) entityManager
                .createNativeQuery(
                        "SELECT COALESCE(MAX(CAST(SUBSTRING(mrn, 5) AS INTEGER)), 10000) " +
                        "FROM patients WHERE tenant_id = :tenantId")
                .setParameter("tenantId", tenantId)
                .getSingleResult();

        int next = (max != null ? max.intValue() : 10000) + 1;
        return "PAT-" + String.format("%05d", next);
    }

    private Patient findPatientOrThrow(String uuid, Long tenantId) {
        return patientRepository.findByTenantIdAndUuid(tenantId, uuid)
                .filter(p -> !p.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.PATIENT_NOT_FOUND));
    }

    private PatientDto toDto(Patient p) {
        int age = p.getDob() != null
                ? Period.between(p.getDob(), LocalDate.now()).getYears()
                : 0;

        return PatientDto.builder()
                .uuid(p.getUuid())
                .mrn(p.getMrn())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .middleName(p.getPreferredName())
                .dateOfBirth(p.getDob())
                .ageYears(age)
                .sex(p.getSex())
                .genderIdentity(p.getGender())
                .phone(p.getPhone())
                .email(p.getEmail())
                .addressLine1(p.getAddressLine1())
                .addressLine2(p.getAddressLine2())
                .city(p.getCity())
                .state(p.getState())
                .zip(p.getZip())
                .emergencyContactName(p.getEmergencyContactName())
                .emergencyContactPhone(p.getEmergencyContactPhone())
                .primaryProviderId(p.getPrimaryProviderId() != null ? p.getPrimaryProviderId().toString() : null)
                .archived(p.isArchive())
                .createdAt(p.getCreatedAt())
                .modifiedAt(p.getModifiedAt())
                .build();
    }

    private PatientSearchResult toSearchResult(Patient p) {
        return PatientSearchResult.builder()
                .uuid(p.getUuid())
                .mrn(p.getMrn())
                .fullName(p.getFirstName() + " " + p.getLastName())
                .dateOfBirth(p.getDob())
                .sex(p.getSex())
                .phone(p.getPhone())
                .primaryProviderId(p.getPrimaryProviderId() != null ? p.getPrimaryProviderId().toString() : null)
                .build();
    }

    private Allergy.AllergySeverity parseSeverity(String severity) {
        if (severity == null) return Allergy.AllergySeverity.UNKNOWN;
        try {
            return Allergy.AllergySeverity.valueOf(severity.toUpperCase());
        } catch (IllegalArgumentException ignored) {
            return Allergy.AllergySeverity.UNKNOWN;
        }
    }

    private Problem.ProblemStatus parseProblemStatus(String status) {
        if (status == null) return Problem.ProblemStatus.ACTIVE;
        try {
            return Problem.ProblemStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException ignored) {
            return Problem.ProblemStatus.ACTIVE;
        }
    }

    private Integer parseIntOrNull(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException ignored) {
            return null;
        }
    }
}
