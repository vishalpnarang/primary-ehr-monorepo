package com.thinkitive.primus.encounter.service;

import com.thinkitive.primus.encounter.dto.EncounterDto;
import com.thinkitive.primus.encounter.entity.AssessmentPlan;
import com.thinkitive.primus.encounter.entity.Encounter;
import com.thinkitive.primus.encounter.entity.Encounter.EncounterStatus;
import com.thinkitive.primus.encounter.entity.Encounter.EncounterType;
import com.thinkitive.primus.encounter.repository.AssessmentPlanRepository;
import com.thinkitive.primus.encounter.repository.EncounterRepository;
import com.thinkitive.primus.patient.entity.Patient;
import com.thinkitive.primus.patient.repository.PatientRepository;
import com.thinkitive.primus.scheduling.repository.AppointmentRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EncounterServiceTest {

    @Mock EncounterRepository encounterRepo;
    @Mock AssessmentPlanRepository assessmentPlanRepo;
    @Mock PatientRepository patientRepo;
    @Mock AppointmentRepository appointmentRepo;

    @InjectMocks
    EncounterServiceImpl encounterService;

    private Patient testPatient;
    private String patientUuid;

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(1L);

        // Set up a security context so currentAuditor() returns a known value
        TestingAuthenticationToken auth =
                new TestingAuthenticationToken("Dr. Sarah Mitchell", null);
        auth.setAuthenticated(true);
        SecurityContextHolder.getContext().setAuthentication(auth);

        patientUuid = UUID.randomUUID().toString();
        testPatient = Patient.builder()
                .tenantId(1L)
                .mrn("PAT-10001")
                .firstName("John")
                .lastName("Doe")
                .dob(LocalDate.of(1980, 1, 15))
                .sex("MALE")
                .status(Patient.PatientStatus.ACTIVE)
                .build();
        testPatient.setId(1L);
        testPatient.setUuid(patientUuid);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
        SecurityContextHolder.clearContext();
    }

    @Test
    void signEncounter_inProgress_shouldSucceed() {
        String uuid = UUID.randomUUID().toString();
        Encounter encounter = buildEncounter(uuid, EncounterStatus.IN_PROGRESS);

        when(encounterRepo.findByTenantIdAndUuid(1L, uuid)).thenReturn(Optional.of(encounter));
        when(encounterRepo.save(any(Encounter.class))).thenAnswer(inv -> inv.getArgument(0));
        when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));
        when(assessmentPlanRepo.findByEncounterIdOrderBySortOrder(1L)).thenReturn(Collections.emptyList());
        // Mock addenda query — return empty list (no addenda)
        when(encounterRepo.findByTenantIdAndPatientIdAndDateBetween(eq(1L), eq(1L), any(), any()))
                .thenReturn(Collections.emptyList());

        EncounterDto result = encounterService.signEncounter(uuid);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo("SIGNED");
        assertThat(result.getSignedAt()).isNotNull();
        assertThat(result.getSignedBy()).isNotBlank();
    }

    @Test
    void signEncounter_alreadySigned_shouldThrow() {
        String uuid = UUID.randomUUID().toString();
        Encounter encounter = buildEncounter(uuid, EncounterStatus.SIGNED);

        when(encounterRepo.findByTenantIdAndUuid(1L, uuid)).thenReturn(Optional.of(encounter));

        assertThatThrownBy(() -> encounterService.signEncounter(uuid))
                .isInstanceOf(PrimusException.class)
                .hasMessageContaining("already signed");
    }

    @Test
    void signEncounter_setsSignedByAndTimestamp() {
        String uuid = UUID.randomUUID().toString();
        Encounter encounter = buildEncounter(uuid, EncounterStatus.IN_PROGRESS);

        when(encounterRepo.findByTenantIdAndUuid(1L, uuid)).thenReturn(Optional.of(encounter));
        when(encounterRepo.save(any(Encounter.class))).thenAnswer(inv -> inv.getArgument(0));
        when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));
        when(assessmentPlanRepo.findByEncounterIdOrderBySortOrder(1L)).thenReturn(Collections.emptyList());
        when(encounterRepo.findByTenantIdAndPatientIdAndDateBetween(eq(1L), eq(1L), any(), any()))
                .thenReturn(Collections.emptyList());

        EncounterDto result = encounterService.signEncounter(uuid);

        assertThat(result.getSignedAt()).isNotNull();
        assertThat(result.getSignedBy()).isEqualTo("Dr. Sarah Mitchell");
        assertThat(result.getStatus()).isEqualTo("SIGNED");
    }

    @Test
    void getEncounter_returnsExpectedFields() {
        String uuid = UUID.randomUUID().toString();
        Encounter encounter = buildEncounter(uuid, EncounterStatus.IN_PROGRESS);

        AssessmentPlan plan = AssessmentPlan.builder()
                .tenantId(1L)
                .encounterId(1L)
                .icdCode("J06.9")
                .diagnosis("Acute upper respiratory infection")
                .plan("Rest and fluids")
                .sortOrder(0)
                .build();
        plan.setId(1L);
        plan.setUuid(UUID.randomUUID().toString());

        when(encounterRepo.findByTenantIdAndUuid(1L, uuid)).thenReturn(Optional.of(encounter));
        when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));
        when(assessmentPlanRepo.findByEncounterIdOrderBySortOrder(1L)).thenReturn(List.of(plan));
        when(encounterRepo.findByTenantIdAndPatientIdAndDateBetween(eq(1L), eq(1L), any(), any()))
                .thenReturn(Collections.emptyList());

        EncounterDto result = encounterService.getEncounter(uuid);

        assertThat(result).isNotNull();
        assertThat(result.getUuid()).isEqualTo(uuid);
        assertThat(result.getStatus()).isEqualTo("IN_PROGRESS");
        assertThat(result.getDiagnosisCodes()).isNotEmpty();
        assertThat(result.getDiagnosisCodes()).contains("J06.9");
    }

    @Test
    void getEncountersByPatient_shouldReturnEncounters() {
        Encounter enc1 = buildEncounter(UUID.randomUUID().toString(), EncounterStatus.SIGNED);
        enc1.setSignedAt(Instant.now());
        enc1.setSignedBy("Dr. Sarah Mitchell");

        Encounter enc2 = buildEncounter(UUID.randomUUID().toString(), EncounterStatus.SIGNED);
        enc2.setSignedAt(Instant.now());
        enc2.setSignedBy("Dr. Sarah Mitchell");

        when(patientRepo.findByTenantIdAndUuid(1L, patientUuid)).thenReturn(Optional.of(testPatient));
        when(encounterRepo.findByTenantIdAndPatientIdOrderByDateDesc(eq(1L), eq(1L), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(enc1, enc2)));
        when(assessmentPlanRepo.findByEncounterIdOrderBySortOrder(anyLong())).thenReturn(Collections.emptyList());
        when(encounterRepo.findByTenantIdAndPatientIdAndDateBetween(eq(1L), eq(1L), any(), any()))
                .thenReturn(Collections.emptyList());

        var encounters = encounterService.getEncountersByPatient(patientUuid);

        assertThat(encounters).isNotNull();
        assertThat(encounters).hasSize(2);
        encounters.forEach(enc -> assertThat(enc.getStatus()).isEqualTo("SIGNED"));
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Encounter buildEncounter( String uuid, EncounterStatus status) {
        Encounter enc = Encounter.builder()
                .tenantId(1L)
                .patientId(1L)
                .providerId(1L)
                .date(LocalDate.now())
                .type(EncounterType.OFFICE_VISIT)
                .status(status)
                .chiefComplaint("Sore throat and fever")
                .build();
        enc.setId(1L);
        enc.setUuid(uuid);
        return enc;
    }
}
