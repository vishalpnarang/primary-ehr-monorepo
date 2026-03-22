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
import com.thinkitive.primus.shared.exception.PrimusException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
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
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class EncounterServiceTest {

    private static final Long TENANT_ID = 1L;

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
        TenantContext.setTenantId(TENANT_ID);

        TestingAuthenticationToken auth =
                new TestingAuthenticationToken("Dr. Sarah Mitchell", null);
        auth.setAuthenticated(true);
        SecurityContextHolder.getContext().setAuthentication(auth);

        patientUuid = UUID.randomUUID().toString();
        testPatient = Patient.builder()
                .tenantId(TENANT_ID)
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

    // ── createEncounter ───────────────────────────────────────────────────────

    @Nested
    @DisplayName("createEncounter")
    class CreateEncounter {

        @Test
        @DisplayName("creates with DRAFT status")
        void createEncounter_draftStatus() {
            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, patientUuid)).thenReturn(Optional.of(testPatient));
            when(appointmentRepo.findByTenantIdAndPatientId(TENANT_ID, 1L)).thenReturn(Collections.emptyList());
            when(encounterRepo.save(any(Encounter.class))).thenAnswer(inv -> {
                Encounter e = inv.getArgument(0);
                e.setId(1L);
                e.setUuid(UUID.randomUUID().toString());
                return e;
            });

            CreateEncounterRequest request = new CreateEncounterRequest();
            request.setPatientUuid(patientUuid);
            request.setAppointmentUuid(null);
            request.setEncounterType("OFFICE_VISIT");
            request.setChiefComplaint("Sore throat");

            EncounterDto result = encounterService.createEncounter(request);

            assertThat(result).isNotNull();
            assertThat(result.getStatus()).isEqualTo("DRAFT");
            assertThat(result.getChiefComplaint()).isEqualTo("Sore throat");
            assertThat(result.getPatientUuid()).isEqualTo(patientUuid);
            assertThat(result.getEncounterType()).isEqualTo("OFFICE_VISIT");
        }

        @Test
        @DisplayName("with appointment -- inherits provider and date from appointment")
        void createEncounter_withAppointment() {
            String appointmentUuid = UUID.randomUUID().toString();
            Appointment appointment = Appointment.builder()
                    .tenantId(TENANT_ID)
                    .patientId(1L)
                    .providerId(42L)
                    .locationId(1L)
                    .type(Appointment.AppointmentType.FOLLOW_UP)
                    .status(Appointment.AppointmentStatus.IN_PROGRESS)
                    .date(LocalDate.of(2026, 3, 25))
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(9, 30))
                    .duration(30)
                    .build();
            appointment.setId(100L);
            appointment.setUuid(appointmentUuid);

            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, patientUuid)).thenReturn(Optional.of(testPatient));
            when(appointmentRepo.findByTenantIdAndPatientId(TENANT_ID, 1L)).thenReturn(List.of(appointment));
            when(encounterRepo.save(any(Encounter.class))).thenAnswer(inv -> {
                Encounter e = inv.getArgument(0);
                assertThat(e.getProviderId()).isEqualTo(42L);
                assertThat(e.getDate()).isEqualTo(LocalDate.of(2026, 3, 25));
                e.setId(1L);
                e.setUuid(UUID.randomUUID().toString());
                return e;
            });

            CreateEncounterRequest request = new CreateEncounterRequest();
            request.setPatientUuid(patientUuid);
            request.setAppointmentUuid(appointmentUuid);
            request.setEncounterType("OFFICE_VISIT");
            request.setChiefComplaint("Follow-up");

            encounterService.createEncounter(request);

            verify(encounterRepo).save(argThat(e ->
                    e.getProviderId().equals(42L) && e.getStatus() == EncounterStatus.DRAFT));
        }

        @Test
        @DisplayName("patient not found -- throws PrimusException")
        void createEncounter_patientNotFound_throws() {
            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, patientUuid)).thenReturn(Optional.empty());

            CreateEncounterRequest request = new CreateEncounterRequest();
            request.setPatientUuid(patientUuid);
            request.setEncounterType("OFFICE_VISIT");

            assertThatThrownBy(() -> encounterService.createEncounter(request))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Patient not found");
        }

        @Test
        @DisplayName("unknown encounter type defaults to OFFICE_VISIT")
        void createEncounter_unknownType_defaultsToOfficeVisit() {
            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, patientUuid)).thenReturn(Optional.of(testPatient));
            when(appointmentRepo.findByTenantIdAndPatientId(TENANT_ID, 1L)).thenReturn(Collections.emptyList());
            when(encounterRepo.save(any(Encounter.class))).thenAnswer(inv -> {
                Encounter e = inv.getArgument(0);
                e.setId(1L);
                e.setUuid(UUID.randomUUID().toString());
                return e;
            });

            CreateEncounterRequest request = new CreateEncounterRequest();
            request.setPatientUuid(patientUuid);
            request.setEncounterType("UNKNOWN_TYPE");
            request.setChiefComplaint("Test");

            EncounterDto result = encounterService.createEncounter(request);

            assertThat(result.getEncounterType()).isEqualTo("OFFICE_VISIT");
        }

        @Test
        @DisplayName("tenant_id is set from TenantContext")
        void createEncounter_setsTenantId() {
            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, patientUuid)).thenReturn(Optional.of(testPatient));
            when(appointmentRepo.findByTenantIdAndPatientId(TENANT_ID, 1L)).thenReturn(Collections.emptyList());
            when(encounterRepo.save(any(Encounter.class))).thenAnswer(inv -> {
                Encounter e = inv.getArgument(0);
                e.setId(1L);
                e.setUuid(UUID.randomUUID().toString());
                return e;
            });

            CreateEncounterRequest request = new CreateEncounterRequest();
            request.setPatientUuid(patientUuid);
            request.setEncounterType("OFFICE_VISIT");
            request.setChiefComplaint("Test");

            encounterService.createEncounter(request);

            verify(encounterRepo).save(argThat(e -> e.getTenantId().equals(TENANT_ID)));
        }
    }

    // ── updateEncounter ───────────────────────────────────────────────────────

    @Nested
    @DisplayName("updateEncounter")
    class UpdateEncounter {

        @Test
        @DisplayName("DRAFT encounter -- updates fields and promotes to IN_PROGRESS")
        void updateEncounter_draftToInProgress() {
            String uuid = UUID.randomUUID().toString();
            Encounter encounter = buildEncounter(uuid, EncounterStatus.DRAFT);

            when(encounterRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(encounter));
            when(encounterRepo.save(any(Encounter.class))).thenAnswer(inv -> inv.getArgument(0));
            when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));
            when(assessmentPlanRepo.findByEncounterIdOrderBySortOrder(1L)).thenReturn(Collections.emptyList());
            when(encounterRepo.findByTenantIdAndPatientIdAndDateBetween(eq(TENANT_ID), eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());

            UpdateEncounterRequest request = new UpdateEncounterRequest();
            request.setSubjective("Patient reports fever for 3 days");
            request.setObjective("Temp 101.2F, throat erythematous");
            request.setChiefComplaint("Fever");

            EncounterDto result = encounterService.updateEncounter(uuid, request);

            assertThat(result.getStatus()).isEqualTo("IN_PROGRESS");
            assertThat(result.getSubjective()).isEqualTo("Patient reports fever for 3 days");
            assertThat(result.getObjective()).isEqualTo("Temp 101.2F, throat erythematous");
            assertThat(result.getChiefComplaint()).isEqualTo("Fever");
        }

        @Test
        @DisplayName("IN_PROGRESS encounter -- stays IN_PROGRESS")
        void updateEncounter_inProgressStays() {
            String uuid = UUID.randomUUID().toString();
            Encounter encounter = buildEncounter(uuid, EncounterStatus.IN_PROGRESS);

            when(encounterRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(encounter));
            when(encounterRepo.save(any(Encounter.class))).thenAnswer(inv -> inv.getArgument(0));
            when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));
            when(assessmentPlanRepo.findByEncounterIdOrderBySortOrder(1L)).thenReturn(Collections.emptyList());
            when(encounterRepo.findByTenantIdAndPatientIdAndDateBetween(eq(TENANT_ID), eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());

            UpdateEncounterRequest request = new UpdateEncounterRequest();
            request.setSubjective("Updated notes");

            EncounterDto result = encounterService.updateEncounter(uuid, request);

            assertThat(result.getStatus()).isEqualTo("IN_PROGRESS");
        }

        @Test
        @DisplayName("SIGNED encounter -- throws ENCOUNTER_LOCKED")
        void updateEncounter_signed_throws() {
            String uuid = UUID.randomUUID().toString();
            Encounter encounter = buildEncounter(uuid, EncounterStatus.SIGNED);
            encounter.setSignedAt(Instant.now());
            encounter.setSignedBy("Dr. Sarah Mitchell");

            when(encounterRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(encounter));

            UpdateEncounterRequest request = new UpdateEncounterRequest();
            request.setSubjective("Trying to modify signed encounter");

            assertThatThrownBy(() -> encounterService.updateEncounter(uuid, request))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("signed and cannot be modified");
        }

        @Test
        @DisplayName("with diagnosis codes -- creates assessment plans")
        void updateEncounter_withDiagnosisCodes() {
            String uuid = UUID.randomUUID().toString();
            Encounter encounter = buildEncounter(uuid, EncounterStatus.DRAFT);

            when(encounterRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(encounter));
            when(encounterRepo.save(any(Encounter.class))).thenAnswer(inv -> inv.getArgument(0));
            when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));
            when(assessmentPlanRepo.findByEncounterIdOrderBySortOrder(1L)).thenReturn(Collections.emptyList());
            when(encounterRepo.findByTenantIdAndPatientIdAndDateBetween(eq(TENANT_ID), eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());

            UpdateEncounterRequest request = new UpdateEncounterRequest();
            request.setDiagnosisCodes(List.of("J06.9", "R50.9"));
            request.setAssessment("URI with fever");
            request.setPlan("Amoxicillin 500mg TID x10 days");

            encounterService.updateEncounter(uuid, request);

            verify(assessmentPlanRepo).deleteByEncounterId(1L);
            verify(assessmentPlanRepo).saveAll(argThat(plans -> {
                List<AssessmentPlan> list = (List<AssessmentPlan>) plans;
                return list.size() == 2;
            }));
        }

        @Test
        @DisplayName("encounter not found -- throws NOT_FOUND")
        void updateEncounter_notFound_throws() {
            String uuid = UUID.randomUUID().toString();
            when(encounterRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.empty());

            UpdateEncounterRequest request = new UpdateEncounterRequest();
            request.setSubjective("test");

            assertThatThrownBy(() -> encounterService.updateEncounter(uuid, request))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Encounter not found");
        }
    }

    // ── signEncounter ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("signEncounter")
    class SignEncounter {

        @Test
        @DisplayName("DRAFT encounter -- signs, sets signedAt and signedBy")
        void signEncounter_draft_succeeds() {
            String uuid = UUID.randomUUID().toString();
            Encounter encounter = buildEncounter(uuid, EncounterStatus.DRAFT);

            stubEncounterSaveAndLookup(uuid, encounter);

            EncounterDto result = encounterService.signEncounter(uuid);

            assertThat(result.getStatus()).isEqualTo("SIGNED");
            assertThat(result.getSignedAt()).isNotNull();
            assertThat(result.getSignedBy()).isEqualTo("Dr. Sarah Mitchell");
        }

        @Test
        @DisplayName("IN_PROGRESS encounter -- signs successfully")
        void signEncounter_inProgress_succeeds() {
            String uuid = UUID.randomUUID().toString();
            Encounter encounter = buildEncounter(uuid, EncounterStatus.IN_PROGRESS);

            stubEncounterSaveAndLookup(uuid, encounter);

            EncounterDto result = encounterService.signEncounter(uuid);

            assertThat(result.getStatus()).isEqualTo("SIGNED");
            assertThat(result.getSignedAt()).isNotNull();
        }

        @Test
        @DisplayName("already SIGNED -- throws ENCOUNTER_LOCKED")
        void signEncounter_alreadySigned_throws() {
            String uuid = UUID.randomUUID().toString();
            Encounter encounter = buildEncounter(uuid, EncounterStatus.SIGNED);
            encounter.setSignedAt(Instant.now());
            encounter.setSignedBy("Dr. Sarah Mitchell");

            when(encounterRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(encounter));

            assertThatThrownBy(() -> encounterService.signEncounter(uuid))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("already signed");
        }

        @Test
        @DisplayName("signed encounter cannot be further updated")
        void signedEncounter_cannotBeUpdated() {
            String uuid = UUID.randomUUID().toString();
            Encounter encounter = buildEncounter(uuid, EncounterStatus.IN_PROGRESS);

            stubEncounterSaveAndLookup(uuid, encounter);

            // Sign it
            encounterService.signEncounter(uuid);

            // Now it's SIGNED; trying to update should fail
            Encounter signed = buildEncounter(uuid, EncounterStatus.SIGNED);
            signed.setSignedAt(Instant.now());
            when(encounterRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(signed));

            UpdateEncounterRequest request = new UpdateEncounterRequest();
            request.setSubjective("Trying to modify");

            assertThatThrownBy(() -> encounterService.updateEncounter(uuid, request))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("signed and cannot be modified");
        }

        @Test
        @DisplayName("not found -- throws NOT_FOUND")
        void signEncounter_notFound_throws() {
            String uuid = UUID.randomUUID().toString();
            when(encounterRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> encounterService.signEncounter(uuid))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Encounter not found");
        }
    }

    // ── addAddendum ───────────────────────────────────────────────────────────

    @Nested
    @DisplayName("addAddendum")
    class AddAddendum {

        @Test
        @DisplayName("SIGNED encounter -- creates addendum successfully")
        void addAddendum_signed_succeeds() {
            String uuid = UUID.randomUUID().toString();
            Encounter original = buildEncounter(uuid, EncounterStatus.SIGNED);
            original.setSignedAt(Instant.now());
            original.setSignedBy("Dr. Sarah Mitchell");

            when(encounterRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(original));
            when(encounterRepo.save(any(Encounter.class))).thenAnswer(inv -> {
                Encounter e = inv.getArgument(0);
                e.setId(2L);
                e.setUuid(UUID.randomUUID().toString());
                return e;
            });
            when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));

            AddendumRequest request = new AddendumRequest();
            request.setText("Additional clinical note: labs reviewed, all WNL.");

            EncounterDto result = encounterService.addAddendum(uuid, request);

            assertThat(result).isNotNull();
            assertThat(result.getStatus()).isEqualTo("ADDENDUM");
            assertThat(result.getSubjective()).isEqualTo("Additional clinical note: labs reviewed, all WNL.");
        }

        @Test
        @DisplayName("DRAFT encounter -- throws BAD_REQUEST")
        void addAddendum_draft_throws() {
            String uuid = UUID.randomUUID().toString();
            Encounter encounter = buildEncounter(uuid, EncounterStatus.DRAFT);

            when(encounterRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(encounter));

            AddendumRequest request = new AddendumRequest();
            request.setText("Should not be allowed on draft");

            assertThatThrownBy(() -> encounterService.addAddendum(uuid, request))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("signed");
        }

        @Test
        @DisplayName("IN_PROGRESS encounter -- throws BAD_REQUEST")
        void addAddendum_inProgress_throws() {
            String uuid = UUID.randomUUID().toString();
            Encounter encounter = buildEncounter(uuid, EncounterStatus.IN_PROGRESS);

            when(encounterRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(encounter));

            AddendumRequest request = new AddendumRequest();
            request.setText("Should not be allowed on in-progress");

            assertThatThrownBy(() -> encounterService.addAddendum(uuid, request))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("signed");
        }

        @Test
        @DisplayName("addendum chief complaint references original UUID")
        void addAddendum_chiefComplaintReferencesOriginal() {
            String uuid = UUID.randomUUID().toString();
            Encounter original = buildEncounter(uuid, EncounterStatus.SIGNED);
            original.setSignedAt(Instant.now());

            when(encounterRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(original));
            when(encounterRepo.save(any(Encounter.class))).thenAnswer(inv -> {
                Encounter e = inv.getArgument(0);
                e.setId(2L);
                e.setUuid(UUID.randomUUID().toString());
                return e;
            });
            when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));

            AddendumRequest request = new AddendumRequest();
            request.setText("Additional note");

            encounterService.addAddendum(uuid, request);

            verify(encounterRepo).save(argThat(e ->
                    e.getChiefComplaint() != null && e.getChiefComplaint().contains(uuid)));
        }
    }

    // ── getEncounter ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getEncounter")
    class GetEncounter {

        @Test
        @DisplayName("returns encounter with assessment plans")
        void getEncounter_withAssessmentPlans() {
            String uuid = UUID.randomUUID().toString();
            Encounter encounter = buildEncounter(uuid, EncounterStatus.IN_PROGRESS);

            AssessmentPlan plan = AssessmentPlan.builder()
                    .tenantId(TENANT_ID)
                    .encounterId(1L)
                    .icdCode("J06.9")
                    .diagnosis("Acute upper respiratory infection")
                    .plan("Rest and fluids")
                    .sortOrder(0)
                    .build();
            plan.setId(1L);
            plan.setUuid(UUID.randomUUID().toString());

            when(encounterRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(encounter));
            when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));
            when(assessmentPlanRepo.findByEncounterIdOrderBySortOrder(1L)).thenReturn(List.of(plan));
            when(encounterRepo.findByTenantIdAndPatientIdAndDateBetween(eq(TENANT_ID), eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());

            EncounterDto result = encounterService.getEncounter(uuid);

            assertThat(result.getUuid()).isEqualTo(uuid);
            assertThat(result.getDiagnosisCodes()).contains("J06.9");
            assertThat(result.getPatientName()).isEqualTo("John Doe");
        }

        @Test
        @DisplayName("not found -- throws NOT_FOUND")
        void getEncounter_notFound_throws() {
            String uuid = UUID.randomUUID().toString();
            when(encounterRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> encounterService.getEncounter(uuid))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Encounter not found");
        }

        @Test
        @DisplayName("archived encounter -- throws NOT_FOUND")
        void getEncounter_archived_throws() {
            String uuid = UUID.randomUUID().toString();
            Encounter encounter = buildEncounter(uuid, EncounterStatus.IN_PROGRESS);
            encounter.setArchive(true);

            when(encounterRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(encounter));

            assertThatThrownBy(() -> encounterService.getEncounter(uuid))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Encounter not found");
        }
    }

    // ── getEncountersByPatient ─────────────────────────────────────────────────

    @Nested
    @DisplayName("getEncountersByPatient")
    class GetEncountersByPatient {

        @Test
        @DisplayName("returns all non-archived encounters for a patient")
        void getEncountersByPatient_returnsEncounters() {
            Encounter enc1 = buildEncounter(UUID.randomUUID().toString(), EncounterStatus.SIGNED);
            enc1.setSignedAt(Instant.now());
            enc1.setSignedBy("Dr. Sarah Mitchell");
            Encounter enc2 = buildEncounter(UUID.randomUUID().toString(), EncounterStatus.IN_PROGRESS);

            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, patientUuid)).thenReturn(Optional.of(testPatient));
            when(encounterRepo.findByTenantIdAndPatientIdOrderByDateDesc(eq(TENANT_ID), eq(1L), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(enc1, enc2)));
            when(assessmentPlanRepo.findByEncounterIdOrderBySortOrder(anyLong())).thenReturn(Collections.emptyList());
            when(encounterRepo.findByTenantIdAndPatientIdAndDateBetween(eq(TENANT_ID), eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());

            var encounters = encounterService.getEncountersByPatient(patientUuid);

            assertThat(encounters).hasSize(2);
        }

        @Test
        @DisplayName("patient not found -- throws PATIENT_NOT_FOUND")
        void getEncountersByPatient_patientNotFound() {
            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, patientUuid)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> encounterService.getEncountersByPatient(patientUuid))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Patient not found");
        }

        @Test
        @DisplayName("excludes archived encounters from results")
        void getEncountersByPatient_excludesArchived() {
            Encounter active = buildEncounter(UUID.randomUUID().toString(), EncounterStatus.SIGNED);
            active.setSignedAt(Instant.now());
            active.setSignedBy("Dr. Sarah Mitchell");

            Encounter archived = buildEncounter(UUID.randomUUID().toString(), EncounterStatus.SIGNED);
            archived.setArchive(true);
            archived.setSignedAt(Instant.now());
            archived.setSignedBy("Dr. Sarah Mitchell");

            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, patientUuid)).thenReturn(Optional.of(testPatient));
            when(encounterRepo.findByTenantIdAndPatientIdOrderByDateDesc(eq(TENANT_ID), eq(1L), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(active, archived)));
            when(assessmentPlanRepo.findByEncounterIdOrderBySortOrder(anyLong())).thenReturn(Collections.emptyList());
            when(encounterRepo.findByTenantIdAndPatientIdAndDateBetween(eq(TENANT_ID), eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());

            var encounters = encounterService.getEncountersByPatient(patientUuid);

            assertThat(encounters).hasSize(1);
        }
    }

    // ── tenant isolation ──────────────────────────────────────────────────────

    @Test
    @DisplayName("all operations use tenant ID from TenantContext")
    void tenantIsolation() {
        TenantContext.setTenantId(99L);

        String uuid = UUID.randomUUID().toString();
        when(encounterRepo.findByTenantIdAndUuid(99L, uuid)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> encounterService.getEncounter(uuid))
                .isInstanceOf(PrimusException.class);

        verify(encounterRepo).findByTenantIdAndUuid(eq(99L), eq(uuid));
        verify(encounterRepo, never()).findByTenantIdAndUuid(eq(TENANT_ID), anyString());
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private void stubEncounterSaveAndLookup(String uuid, Encounter encounter) {
        when(encounterRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(encounter));
        when(encounterRepo.save(any(Encounter.class))).thenAnswer(inv -> inv.getArgument(0));
        when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));
        when(assessmentPlanRepo.findByEncounterIdOrderBySortOrder(1L)).thenReturn(Collections.emptyList());
        when(encounterRepo.findByTenantIdAndPatientIdAndDateBetween(eq(TENANT_ID), eq(1L), any(), any()))
                .thenReturn(Collections.emptyList());
    }

    private Encounter buildEncounter(String uuid, EncounterStatus status) {
        Encounter enc = Encounter.builder()
                .tenantId(TENANT_ID)
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
