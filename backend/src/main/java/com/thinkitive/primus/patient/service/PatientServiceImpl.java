package com.thinkitive.primus.patient.service;

import com.thinkitive.primus.patient.dto.*;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.Period;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Phase-0 stub implementation — returns in-memory mock data.
 * Replace with JPA repository calls in Phase 2.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PatientServiceImpl implements PatientService {

    // Sequence counter — per tenant in real impl (backed by DB sequence)
    private final AtomicInteger mrnSequence = new AtomicInteger(1000);

    @Override
    @Transactional
    public PatientDto createPatient(CreatePatientRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating patient for tenant={} name={} {}", tenantId, request.getFirstName(), request.getLastName());

        // Duplicate detection would query: firstName + lastName + DOB within tenant
        String mrn = "PAT-" + String.format("%05d", mrnSequence.incrementAndGet());

        int age = Period.between(request.getDateOfBirth(), LocalDate.now()).getYears();

        return PatientDto.builder()
                .uuid(UUID.randomUUID())
                .mrn(mrn)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .middleName(request.getMiddleName())
                .dateOfBirth(request.getDateOfBirth())
                .ageYears(age)
                .sex(request.getSex())
                .genderIdentity(request.getGenderIdentity())
                .phone(request.getPhone())
                .email(request.getEmail())
                .addressLine1(request.getAddressLine1())
                .city(request.getCity())
                .state(request.getState())
                .zip(request.getZip())
                .insurancePlanName(request.getInsurancePlanName())
                .insuranceMemberId(request.getInsuranceMemberId())
                .emergencyContactName(request.getEmergencyContactName())
                .primaryProviderId(request.getPrimaryProviderId())
                .archived(false)
                .createdAt(Instant.now())
                .build();
    }

    @Override
    public PatientDto getPatient(UUID uuid) {
        // Phase 2: return patientRepository.findByUuidAndTenantId(uuid, TenantContext.getTenantId())
        //          .map(patientMapper::toDto)
        //          .orElseThrow(() -> new PrimusException(ResponseCode.PATIENT_NOT_FOUND));
        return buildMockPatient(uuid);
    }

    @Override
    @Transactional
    public PatientDto updatePatient(UUID uuid, UpdatePatientRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Updating patient uuid={} tenant={}", uuid, tenantId);
        PatientDto existing = getPatient(uuid);
        if (existing == null) throw new PrimusException(ResponseCode.PATIENT_NOT_FOUND);

        // Phase 2: fetch entity → apply fields → save
        if (request.getFirstName() != null) existing.setFirstName(request.getFirstName());
        if (request.getLastName()  != null) existing.setLastName(request.getLastName());
        if (request.getPhone()     != null) existing.setPhone(request.getPhone());
        if (request.getEmail()     != null) existing.setEmail(request.getEmail());
        existing.setModifiedAt(Instant.now());
        return existing;
    }

    @Override
    @Transactional
    public void deletePatient(UUID uuid) {
        log.info("Soft-deleting patient uuid={}", uuid);
        // Phase 2: entity.setArchive(true); patientRepository.save(entity);
    }

    @Override
    public Page<PatientSearchResult> searchPatients(String query, Pageable pageable) {
        List<PatientSearchResult> results = List.of(
                PatientSearchResult.builder()
                        .uuid(UUID.fromString("aaaaaaaa-0000-0000-0000-000000000001"))
                        .mrn("PAT-10001")
                        .fullName("James Anderson")
                        .dateOfBirth(LocalDate.of(1978, 4, 12))
                        .sex("MALE")
                        .phone("5551234567")
                        .build()
        );
        return new PageImpl<>(results, pageable, results.size());
    }

    @Override
    public Page<PatientDto> listPatients(Pageable pageable) {
        List<PatientDto> list = List.of(buildMockPatient(UUID.fromString("aaaaaaaa-0000-0000-0000-000000000001")));
        return new PageImpl<>(list, pageable, list.size());
    }

    @Override
    @Transactional
    public AllergyDto addAllergy(UUID patientUuid, AllergyRequest request) {
        return AllergyDto.builder()
                .uuid(UUID.randomUUID())
                .patientUuid(patientUuid)
                .allergen(request.getAllergen())
                .reaction(request.getReaction())
                .severity(request.getSeverity())
                .notes(request.getNotes())
                .recordedAt(Instant.now())
                .build();
    }

    @Override
    @Transactional
    public ProblemDto addProblem(UUID patientUuid, ProblemRequest request) {
        return ProblemDto.builder()
                .uuid(UUID.randomUUID())
                .patientUuid(patientUuid)
                .icd10Code(request.getIcd10Code())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .onsetDate(request.getOnsetDate())
                .notes(request.getNotes())
                .recordedAt(Instant.now())
                .build();
    }

    @Override
    @Transactional
    public VitalsDto recordVitals(UUID patientUuid, VitalsRequest request) {
        String bp = request.getBloodPressureSystolic() != null
                ? request.getBloodPressureSystolic() + "/" + request.getBloodPressureDiastolic()
                : null;
        return VitalsDto.builder()
                .uuid(UUID.randomUUID())
                .patientUuid(patientUuid)
                .recordedAt(request.getRecordedAt())
                .weightLbs(request.getWeightLbs())
                .heightInches(request.getHeightInches())
                .bloodPressure(bp)
                .heartRateBpm(request.getHeartRateBpm())
                .temperatureFahrenheit(request.getTemperatureFahrenheit())
                .oxygenSaturationPercent(request.getOxygenSaturationPercent())
                .notes(request.getNotes())
                .build();
    }

    @Override
    public List<TimelineEventDto> getTimeline(UUID patientUuid) {
        return List.of(
                TimelineEventDto.builder()
                        .uuid(UUID.randomUUID())
                        .eventType("ENCOUNTER")
                        .title("Office Visit")
                        .summary("Annual wellness exam with Dr. Mitchell")
                        .occurredAt(Instant.now().minusSeconds(86400))
                        .providerName("Dr. Sarah Mitchell")
                        .build(),
                TimelineEventDto.builder()
                        .uuid(UUID.randomUUID())
                        .eventType("PRESCRIPTION")
                        .title("Lisinopril 10mg prescribed")
                        .summary("30-day supply, 1 refill")
                        .occurredAt(Instant.now().minusSeconds(172800))
                        .providerName("Dr. Sarah Mitchell")
                        .build()
        );
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private PatientDto buildMockPatient(UUID uuid) {
        return PatientDto.builder()
                .uuid(uuid)
                .mrn("PAT-10001")
                .firstName("James")
                .lastName("Anderson")
                .dateOfBirth(LocalDate.of(1978, 4, 12))
                .ageYears(Period.between(LocalDate.of(1978, 4, 12), LocalDate.now()).getYears())
                .sex("MALE")
                .phone("5551234567")
                .email("james.anderson@email.com")
                .addressLine1("1234 Maple Street")
                .city("Columbus")
                .state("OH")
                .zip("43215")
                .archived(false)
                .createdAt(Instant.now().minusSeconds(31536000))
                .build();
    }
}
