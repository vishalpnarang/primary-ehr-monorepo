package com.thinkitive.primus.patient.service;

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
import com.thinkitive.primus.shared.exception.PrimusException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock PatientRepository patientRepo;
    @Mock AllergyRepository allergyRepo;
    @Mock ProblemRepository problemRepo;
    @Mock VitalSignsRepository vitalSignsRepo;
    @Mock EncounterRepository encounterRepo;
    @Mock EntityManager entityManager;
    @Mock Query nativeQuery;

    @InjectMocks
    PatientServiceImpl patientService;

    private static final Long TENANT_ID = 1L;

    @BeforeEach
    void setTenant() {
        TenantContext.setTenantId(TENANT_ID);
        ReflectionTestUtils.setField(patientService, "entityManager", entityManager);
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    // ── createPatient ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("createPatient")
    class CreatePatient {

        @Test
        @DisplayName("happy path -- generates MRN, sets all fields, returns DTO")
        void createPatient_happyPath() {
            stubMrnGeneration(10000);
            stubPatientSave();

            CreatePatientRequest request = buildFullRequest();
            PatientDto result = patientService.createPatient(request);

            assertThat(result).isNotNull();
            assertThat(result.getMrn()).isEqualTo("PAT-10001");
            assertThat(result.getFirstName()).isEqualTo("Jane");
            assertThat(result.getLastName()).isEqualTo("Smith");
            assertThat(result.getSex()).isEqualTo("FEMALE");
            assertThat(result.getDateOfBirth()).isEqualTo(LocalDate.of(1990, 6, 15));
            assertThat(result.getEmail()).isEqualTo("jane.smith@email.com");
            assertThat(result.getPhone()).isEqualTo("5551234567");
            assertThat(result.getCity()).isEqualTo("Boston");
            assertThat(result.getState()).isEqualTo("MA");
            assertThat(result.getZip()).isEqualTo("02101");
            assertThat(result.isArchived()).isFalse();
            assertThat(result.getUuid()).isNotNull();
        }

        @Test
        @DisplayName("tenant_id is always set from TenantContext")
        void createPatient_setsTenantId() {
            stubMrnGeneration(10000);

            when(patientRepo.save(any(Patient.class))).thenAnswer(inv -> {
                Patient p = inv.getArgument(0);
                assertThat(p.getTenantId()).isEqualTo(TENANT_ID);
                p.setId(1L);
                p.setUuid(UUID.randomUUID().toString());
                return p;
            });

            CreatePatientRequest request = buildMinimalRequest("Test", "User", LocalDate.of(2000, 1, 1));
            patientService.createPatient(request);

            verify(patientRepo).save(argThat(p -> p.getTenantId().equals(TENANT_ID)));
        }

        @Test
        @DisplayName("MRN is unique for sequential calls")
        void createPatient_mrnIsUnique() {
            when(entityManager.createNativeQuery(anyString())).thenReturn(nativeQuery);
            when(nativeQuery.setParameter(eq("tenantId"), any())).thenReturn(nativeQuery);
            when(nativeQuery.getSingleResult()).thenReturn(10000, 10001);
            stubPatientSave();

            PatientDto p1 = patientService.createPatient(buildMinimalRequest("Alice", "Brown", LocalDate.of(1985, 3, 20)));
            PatientDto p2 = patientService.createPatient(buildMinimalRequest("Bob", "Davis", LocalDate.of(1975, 11, 5)));

            assertThat(p1.getMrn()).isNotEqualTo(p2.getMrn());
            assertThat(p1.getMrn()).isEqualTo("PAT-10001");
            assertThat(p2.getMrn()).isEqualTo("PAT-10002");
        }

        @Test
        @DisplayName("status is set to ACTIVE on creation")
        void createPatient_statusIsActive() {
            stubMrnGeneration(10000);

            when(patientRepo.save(any(Patient.class))).thenAnswer(inv -> {
                Patient p = inv.getArgument(0);
                assertThat(p.getStatus()).isEqualTo(Patient.PatientStatus.ACTIVE);
                p.setId(1L);
                p.setUuid(UUID.randomUUID().toString());
                return p;
            });

            patientService.createPatient(buildMinimalRequest("Test", "Patient", LocalDate.of(2000, 1, 1)));

            verify(patientRepo).save(argThat(p -> p.getStatus() == Patient.PatientStatus.ACTIVE));
        }

        @Test
        @DisplayName("emergency contact fields are mapped correctly")
        void createPatient_emergencyContactMapped() {
            stubMrnGeneration(10000);

            when(patientRepo.save(any(Patient.class))).thenAnswer(inv -> {
                Patient p = inv.getArgument(0);
                assertThat(p.getEmergencyContactName()).isEqualTo("John Smith");
                assertThat(p.getEmergencyContactPhone()).isEqualTo("5559876543");
                assertThat(p.getEmergencyContactRelation()).isEqualTo("Spouse");
                p.setId(1L);
                p.setUuid(UUID.randomUUID().toString());
                return p;
            });

            CreatePatientRequest request = buildFullRequest();
            patientService.createPatient(request);

            verify(patientRepo).save(any(Patient.class));
        }

        @Test
        @DisplayName("duplicate MRN throws DataIntegrityViolation (bubbles up)")
        void createPatient_duplicateMrn_throws() {
            stubMrnGeneration(10001);
            when(patientRepo.save(any(Patient.class))).thenThrow(
                    new org.springframework.dao.DataIntegrityViolationException(
                            "duplicate key value violates unique constraint \"uq_patient_tenant_mrn\""));

            CreatePatientRequest request = buildMinimalRequest("Dup", "Patient", LocalDate.of(1988, 4, 12));

            assertThatThrownBy(() -> patientService.createPatient(request))
                    .isInstanceOf(Exception.class);
        }
    }

    // ── getPatient ────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getPatient")
    class GetPatient {

        @Test
        @DisplayName("existing patient -- returns full DTO with age calculated")
        void getPatient_existingPatient_returnsDto() {
            String uuid = UUID.randomUUID().toString();
            Patient patient = buildPatient(uuid, "James", "Wilson", LocalDate.of(1980, 1, 15));

            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(patient));

            PatientDto result = patientService.getPatient(uuid);

            assertThat(result).isNotNull();
            assertThat(result.getUuid()).isEqualTo(uuid);
            assertThat(result.getMrn()).isEqualTo("PAT-10001");
            assertThat(result.getFirstName()).isEqualTo("James");
            assertThat(result.getLastName()).isEqualTo("Wilson");
            assertThat(result.getAgeYears()).isGreaterThan(0);
        }

        @Test
        @DisplayName("not found -- throws PrimusException with PATIENT_NOT_FOUND")
        void getPatient_notFound_throwsException() {
            String uuid = UUID.randomUUID().toString();
            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> patientService.getPatient(uuid))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Patient not found");
        }

        @Test
        @DisplayName("archived patient -- throws PrimusException (filtered out)")
        void getPatient_archivedPatient_throwsException() {
            String uuid = UUID.randomUUID().toString();
            Patient patient = buildPatient(uuid, "Archived", "Patient", LocalDate.of(1990, 1, 1));
            patient.setArchive(true);

            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(patient));

            assertThatThrownBy(() -> patientService.getPatient(uuid))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Patient not found");
        }

        @Test
        @DisplayName("patient with null DOB -- age is 0")
        void getPatient_nullDob_ageIsZero() {
            String uuid = UUID.randomUUID().toString();
            Patient patient = buildPatient(uuid, "No", "Dob", null);

            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(patient));

            PatientDto result = patientService.getPatient(uuid);
            assertThat(result.getAgeYears()).isEqualTo(0);
        }

        @Test
        @DisplayName("tenant isolation -- uses TenantContext tenant ID")
        void getPatient_tenantIsolation() {
            String uuid = UUID.randomUUID().toString();
            Patient patient = buildPatient(uuid, "Tenant", "Test", LocalDate.of(1995, 5, 5));

            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(patient));

            patientService.getPatient(uuid);

            verify(patientRepo).findByTenantIdAndUuid(eq(TENANT_ID), eq(uuid));
            verify(patientRepo, never()).findByTenantIdAndUuid(eq(2L), anyString());
        }
    }

    // ── updatePatient ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("updatePatient")
    class UpdatePatient {

        @Test
        @DisplayName("partial update -- only changed fields are modified")
        void updatePatient_partialUpdate() {
            String uuid = UUID.randomUUID().toString();
            Patient patient = buildPatient(uuid, "Original", "Name", LocalDate.of(1985, 3, 10));
            patient.setPhone("5550000000");
            patient.setEmail("original@email.com");

            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(patient));
            when(patientRepo.save(any(Patient.class))).thenAnswer(inv -> inv.getArgument(0));

            UpdatePatientRequest request = new UpdatePatientRequest();
            request.setPhone("5551111111"); // Only change phone

            PatientDto result = patientService.updatePatient(uuid, request);

            assertThat(result.getPhone()).isEqualTo("5551111111");
            assertThat(result.getFirstName()).isEqualTo("Original"); // unchanged
            assertThat(result.getLastName()).isEqualTo("Name");     // unchanged
            assertThat(result.getEmail()).isEqualTo("original@email.com"); // unchanged
        }

        @Test
        @DisplayName("update all demographics -- first, last, dob, sex, gender, phone, email")
        void updatePatient_allDemographics() {
            String uuid = UUID.randomUUID().toString();
            Patient patient = buildPatient(uuid, "Old", "Name", LocalDate.of(1985, 3, 10));

            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(patient));
            when(patientRepo.save(any(Patient.class))).thenAnswer(inv -> inv.getArgument(0));

            UpdatePatientRequest request = new UpdatePatientRequest();
            request.setFirstName("New");
            request.setLastName("Updated");
            request.setDateOfBirth(LocalDate.of(1990, 7, 20));
            request.setSex("MALE");
            request.setGenderIdentity("Non-binary");
            request.setPhone("5552222222");
            request.setEmail("new@email.com");

            PatientDto result = patientService.updatePatient(uuid, request);

            assertThat(result.getFirstName()).isEqualTo("New");
            assertThat(result.getLastName()).isEqualTo("Updated");
            assertThat(result.getDateOfBirth()).isEqualTo(LocalDate.of(1990, 7, 20));
            assertThat(result.getSex()).isEqualTo("MALE");
            assertThat(result.getGenderIdentity()).isEqualTo("Non-binary");
            assertThat(result.getPhone()).isEqualTo("5552222222");
            assertThat(result.getEmail()).isEqualTo("new@email.com");
        }

        @Test
        @DisplayName("update address fields")
        void updatePatient_addressFields() {
            String uuid = UUID.randomUUID().toString();
            Patient patient = buildPatient(uuid, "Address", "Test", LocalDate.of(1985, 3, 10));

            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(patient));
            when(patientRepo.save(any(Patient.class))).thenAnswer(inv -> inv.getArgument(0));

            UpdatePatientRequest request = new UpdatePatientRequest();
            request.setAddressLine1("123 Main St");
            request.setCity("New York");
            request.setState("NY");
            request.setZip("10001");

            PatientDto result = patientService.updatePatient(uuid, request);

            assertThat(result.getAddressLine1()).isEqualTo("123 Main St");
            assertThat(result.getCity()).isEqualTo("New York");
            assertThat(result.getState()).isEqualTo("NY");
            assertThat(result.getZip()).isEqualTo("10001");
        }

        @Test
        @DisplayName("update emergency contact fields")
        void updatePatient_emergencyContact() {
            String uuid = UUID.randomUUID().toString();
            Patient patient = buildPatient(uuid, "EC", "Test", LocalDate.of(1985, 3, 10));

            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(patient));
            when(patientRepo.save(any(Patient.class))).thenAnswer(inv -> inv.getArgument(0));

            UpdatePatientRequest request = new UpdatePatientRequest();
            request.setEmergencyContactName("Emergency Person");
            request.setEmergencyContactPhone("5553333333");
            request.setEmergencyContactRelationship("Parent");

            PatientDto result = patientService.updatePatient(uuid, request);

            assertThat(result.getEmergencyContactName()).isEqualTo("Emergency Person");
            assertThat(result.getEmergencyContactPhone()).isEqualTo("5553333333");
        }

        @Test
        @DisplayName("patient not found -- throws PrimusException")
        void updatePatient_notFound_throws() {
            String uuid = UUID.randomUUID().toString();
            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.empty());

            UpdatePatientRequest request = new UpdatePatientRequest();
            request.setFirstName("Doesnt");

            assertThatThrownBy(() -> patientService.updatePatient(uuid, request))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Patient not found");
        }
    }

    // ── deletePatient (soft delete) ───────────────────────────────────────────

    @Nested
    @DisplayName("deletePatient (soft delete)")
    class DeletePatient {

        @Test
        @DisplayName("sets archive=true and saves")
        void deletePatient_softDelete() {
            String uuid = UUID.randomUUID().toString();
            Patient patient = buildPatient(uuid, "Delete", "Me", LocalDate.of(1990, 1, 1));
            assertThat(patient.isArchive()).isFalse();

            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(patient));
            when(patientRepo.save(any(Patient.class))).thenAnswer(inv -> inv.getArgument(0));

            patientService.deletePatient(uuid);

            verify(patientRepo).save(argThat(Patient::isArchive));
        }

        @Test
        @DisplayName("deleting non-existent patient throws exception")
        void deletePatient_notFound_throws() {
            String uuid = UUID.randomUUID().toString();
            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> patientService.deletePatient(uuid))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Patient not found");
        }

        @Test
        @DisplayName("deleting already archived patient throws exception")
        void deletePatient_alreadyArchived_throws() {
            String uuid = UUID.randomUUID().toString();
            Patient patient = buildPatient(uuid, "Already", "Archived", LocalDate.of(1990, 1, 1));
            patient.setArchive(true);

            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(patient));

            assertThatThrownBy(() -> patientService.deletePatient(uuid))
                    .isInstanceOf(PrimusException.class);
        }
    }

    // ── listPatients ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("listPatients")
    class ListPatients {

        @Test
        @DisplayName("returns paged results")
        void listPatients_returnsPaged() {
            Patient p1 = buildPatient(UUID.randomUUID().toString(), "Jane", "Doe", LocalDate.of(1990, 5, 20));
            Patient p2 = buildPatient(UUID.randomUUID().toString(), "John", "Doe", LocalDate.of(1985, 8, 12));

            PageRequest pageable = PageRequest.of(0, 20);
            when(patientRepo.findByTenantIdAndArchiveFalse(TENANT_ID, pageable))
                    .thenReturn(new PageImpl<>(List.of(p1, p2), pageable, 2));

            Page<PatientDto> page = patientService.listPatients(pageable);

            assertThat(page).isNotNull();
            assertThat(page.getContent()).hasSize(2);
            assertThat(page.getTotalElements()).isEqualTo(2);
        }

        @Test
        @DisplayName("empty result returns empty page")
        void listPatients_emptyResult() {
            PageRequest pageable = PageRequest.of(0, 20);
            when(patientRepo.findByTenantIdAndArchiveFalse(TENANT_ID, pageable))
                    .thenReturn(new PageImpl<>(Collections.emptyList(), pageable, 0));

            Page<PatientDto> page = patientService.listPatients(pageable);

            assertThat(page.getContent()).isEmpty();
            assertThat(page.getTotalElements()).isEqualTo(0);
        }

        @Test
        @DisplayName("uses tenant ID for filtering")
        void listPatients_usesTenantId() {
            PageRequest pageable = PageRequest.of(0, 10);
            when(patientRepo.findByTenantIdAndArchiveFalse(TENANT_ID, pageable))
                    .thenReturn(new PageImpl<>(Collections.emptyList()));

            patientService.listPatients(pageable);

            verify(patientRepo).findByTenantIdAndArchiveFalse(eq(TENANT_ID), eq(pageable));
        }
    }

    // ── searchPatients ────────────────────────────────────────────────────────

    @Nested
    @DisplayName("searchPatients")
    class SearchPatients {

        @Test
        @DisplayName("search by name returns results")
        void searchPatients_byName() {
            Patient patient = buildPatient(UUID.randomUUID().toString(), "James", "Wilson", LocalDate.of(1980, 1, 15));

            PageRequest pageable = PageRequest.of(0, 20);
            when(patientRepo.searchByName(TENANT_ID, "James", pageable))
                    .thenReturn(new PageImpl<>(List.of(patient), pageable, 1));

            Page<PatientSearchResult> results = patientService.searchPatients("James", pageable);

            assertThat(results).isNotNull();
            assertThat(results.getContent()).hasSize(1);
            PatientSearchResult first = results.getContent().get(0);
            assertThat(first.getFullName()).isEqualTo("James Wilson");
            assertThat(first.getMrn()).startsWith("PAT-");
        }

        @Test
        @DisplayName("search returns correct fullName concatenation")
        void searchPatients_fullNameFormat() {
            Patient patient = buildPatient(UUID.randomUUID().toString(), "Mary", "Johnson", LocalDate.of(1970, 3, 25));

            PageRequest pageable = PageRequest.of(0, 20);
            when(patientRepo.searchByName(TENANT_ID, "Mary", pageable))
                    .thenReturn(new PageImpl<>(List.of(patient), pageable, 1));

            Page<PatientSearchResult> results = patientService.searchPatients("Mary", pageable);

            assertThat(results.getContent().get(0).getFullName()).isEqualTo("Mary Johnson");
        }

        @Test
        @DisplayName("empty query returns all (delegates to searchByName)")
        void searchPatients_emptyQuery() {
            Patient patient = buildPatient(UUID.randomUUID().toString(), "Carol", "Johnson", LocalDate.of(1972, 9, 3));

            PageRequest pageable = PageRequest.of(0, 20);
            when(patientRepo.searchByName(TENANT_ID, "", pageable))
                    .thenReturn(new PageImpl<>(List.of(patient), pageable, 1));

            Page<PatientSearchResult> results = patientService.searchPatients("", pageable);

            assertThat(results.getContent()).isNotNull();
        }

        @Test
        @DisplayName("no results returns empty page")
        void searchPatients_noResults() {
            PageRequest pageable = PageRequest.of(0, 20);
            when(patientRepo.searchByName(TENANT_ID, "Nonexistent", pageable))
                    .thenReturn(new PageImpl<>(Collections.emptyList(), pageable, 0));

            Page<PatientSearchResult> results = patientService.searchPatients("Nonexistent", pageable);

            assertThat(results.getContent()).isEmpty();
        }
    }

    // ── addAllergy ────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("addAllergy")
    class AddAllergy {

        @Test
        @DisplayName("happy path -- saves allergy with correct fields")
        void addAllergy_happyPath() {
            String patientUuid = UUID.randomUUID().toString();
            Patient patient = buildPatient(patientUuid, "Allergic", "Patient", LocalDate.of(1990, 1, 1));

            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, patientUuid)).thenReturn(Optional.of(patient));
            when(allergyRepo.save(any(Allergy.class))).thenAnswer(inv -> {
                Allergy a = inv.getArgument(0);
                a.setId(1L);
                a.setUuid(UUID.randomUUID().toString());
                a.setCreatedAt(Instant.now());
                return a;
            });

            AllergyRequest request = new AllergyRequest();
            request.setAllergen("Penicillin");
            request.setReaction("Hives");
            request.setSeverity("SEVERE");

            AllergyDto result = patientService.addAllergy(patientUuid, request);

            assertThat(result).isNotNull();
            assertThat(result.getAllergen()).isEqualTo("Penicillin");
            assertThat(result.getReaction()).isEqualTo("Hives");
            assertThat(result.getSeverity()).isEqualTo("SEVERE");
            assertThat(result.getPatientUuid()).isEqualTo(patientUuid);
        }

        @Test
        @DisplayName("unknown severity defaults to UNKNOWN")
        void addAllergy_unknownSeverity() {
            String patientUuid = UUID.randomUUID().toString();
            Patient patient = buildPatient(patientUuid, "Test", "Patient", LocalDate.of(1990, 1, 1));

            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, patientUuid)).thenReturn(Optional.of(patient));
            when(allergyRepo.save(any(Allergy.class))).thenAnswer(inv -> {
                Allergy a = inv.getArgument(0);
                a.setId(1L);
                a.setUuid(UUID.randomUUID().toString());
                a.setCreatedAt(Instant.now());
                return a;
            });

            AllergyRequest request = new AllergyRequest();
            request.setAllergen("Pollen");
            request.setReaction("Sneezing");
            request.setSeverity("INVALID_SEVERITY");

            AllergyDto result = patientService.addAllergy(patientUuid, request);

            assertThat(result.getSeverity()).isEqualTo("UNKNOWN");
        }
    }

    // ── addProblem ────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("addProblem")
    class AddProblem {

        @Test
        @DisplayName("happy path -- saves problem with ICD-10 code")
        void addProblem_happyPath() {
            String patientUuid = UUID.randomUUID().toString();
            Patient patient = buildPatient(patientUuid, "Problem", "Patient", LocalDate.of(1990, 1, 1));

            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, patientUuid)).thenReturn(Optional.of(patient));
            when(problemRepo.save(any(Problem.class))).thenAnswer(inv -> {
                Problem p = inv.getArgument(0);
                p.setId(1L);
                p.setUuid(UUID.randomUUID().toString());
                p.setCreatedAt(Instant.now());
                return p;
            });

            ProblemRequest request = new ProblemRequest();
            request.setIcd10Code("E11.9");
            request.setDescription("Type 2 diabetes mellitus without complications");
            request.setStatus("ACTIVE");

            ProblemDto result = patientService.addProblem(patientUuid, request);

            assertThat(result).isNotNull();
            assertThat(result.getIcd10Code()).isEqualTo("E11.9");
            assertThat(result.getDescription()).isEqualTo("Type 2 diabetes mellitus without complications");
            assertThat(result.getStatus()).isEqualTo("ACTIVE");
        }

        @Test
        @DisplayName("null status defaults to ACTIVE")
        void addProblem_nullStatus_defaultsToActive() {
            String patientUuid = UUID.randomUUID().toString();
            Patient patient = buildPatient(patientUuid, "Test", "Patient", LocalDate.of(1990, 1, 1));

            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, patientUuid)).thenReturn(Optional.of(patient));
            when(problemRepo.save(any(Problem.class))).thenAnswer(inv -> {
                Problem p = inv.getArgument(0);
                assertThat(p.getStatus()).isEqualTo(Problem.ProblemStatus.ACTIVE);
                p.setId(1L);
                p.setUuid(UUID.randomUUID().toString());
                p.setCreatedAt(Instant.now());
                return p;
            });

            ProblemRequest request = new ProblemRequest();
            request.setIcd10Code("J45.20");
            request.setDescription("Mild intermittent asthma");
            // status is null -- should default to ACTIVE

            patientService.addProblem(patientUuid, request);

            verify(problemRepo).save(argThat(p -> p.getStatus() == Problem.ProblemStatus.ACTIVE));
        }
    }

    // ── recordVitals ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("recordVitals")
    class RecordVitals {

        @Test
        @DisplayName("happy path -- saves vitals with all fields")
        void recordVitals_happyPath() {
            String patientUuid = UUID.randomUUID().toString();
            Patient patient = buildPatient(patientUuid, "Vitals", "Patient", LocalDate.of(1990, 1, 1));

            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, patientUuid)).thenReturn(Optional.of(patient));
            when(vitalSignsRepo.save(any(VitalSigns.class))).thenAnswer(inv -> {
                VitalSigns v = inv.getArgument(0);
                v.setId(1L);
                v.setUuid(UUID.randomUUID().toString());
                return v;
            });

            VitalsRequest request = new VitalsRequest();
            request.setBloodPressureSystolic("120");
            request.setBloodPressureDiastolic("80");
            request.setHeartRateBpm(72);
            request.setRespiratoryRateBpm(16);
            request.setTemperatureFahrenheit(98.6);
            request.setOxygenSaturationPercent(98.0);
            request.setWeightLbs(170.0);
            request.setHeightInches(70.0);
            request.setRecordedAt(Instant.now());

            VitalsDto result = patientService.recordVitals(patientUuid, request);

            assertThat(result).isNotNull();
            assertThat(result.getBloodPressure()).isEqualTo("120/80");
            assertThat(result.getHeartRateBpm()).isEqualTo(72);
            assertThat(result.getRespiratoryRateBpm()).isEqualTo(16);
        }
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private void stubMrnGeneration(int currentMax) {
        when(entityManager.createNativeQuery(anyString())).thenReturn(nativeQuery);
        when(nativeQuery.setParameter(eq("tenantId"), any())).thenReturn(nativeQuery);
        when(nativeQuery.getSingleResult()).thenReturn(currentMax);
    }

    private void stubPatientSave() {
        when(patientRepo.save(any(Patient.class))).thenAnswer(inv -> {
            Patient p = inv.getArgument(0);
            p.setId(System.nanoTime());
            p.setUuid(UUID.randomUUID().toString());
            return p;
        });
    }

    private Patient buildPatient(String uuid, String firstName, String lastName, LocalDate dob) {
        Patient patient = Patient.builder()
                .tenantId(TENANT_ID)
                .mrn("PAT-10001")
                .firstName(firstName)
                .lastName(lastName)
                .dob(dob)
                .sex("MALE")
                .status(Patient.PatientStatus.ACTIVE)
                .build();
        patient.setId(1L);
        patient.setUuid(uuid);
        return patient;
    }

    private CreatePatientRequest buildFullRequest() {
        CreatePatientRequest req = new CreatePatientRequest();
        req.setFirstName("Jane");
        req.setLastName("Smith");
        req.setDateOfBirth(LocalDate.of(1990, 6, 15));
        req.setSex("FEMALE");
        req.setGenderIdentity("Female");
        req.setPhone("5551234567");
        req.setEmail("jane.smith@email.com");
        req.setAddressLine1("456 Oak Ave");
        req.setCity("Boston");
        req.setState("MA");
        req.setZip("02101");
        req.setEmergencyContactName("John Smith");
        req.setEmergencyContactPhone("5559876543");
        req.setEmergencyContactRelationship("Spouse");
        return req;
    }

    private CreatePatientRequest buildMinimalRequest(String first, String last, LocalDate dob) {
        CreatePatientRequest req = new CreatePatientRequest();
        req.setFirstName(first);
        req.setLastName(last);
        req.setDateOfBirth(dob);
        req.setSex("FEMALE");
        return req;
    }
}
