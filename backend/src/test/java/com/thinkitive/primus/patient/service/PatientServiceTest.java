package com.thinkitive.primus.patient.service;

import com.thinkitive.primus.encounter.repository.EncounterRepository;
import com.thinkitive.primus.patient.dto.CreatePatientRequest;
import com.thinkitive.primus.patient.dto.PatientDto;
import com.thinkitive.primus.patient.dto.PatientSearchResult;
import com.thinkitive.primus.patient.entity.Patient;
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

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

    @BeforeEach
    void setTenant() {
        TenantContext.setTenantId(1L);
        // EntityManager is injected via @PersistenceContext (field injection),
        // which @InjectMocks does not handle — inject it manually.
        ReflectionTestUtils.setField(patientService, "entityManager", entityManager);
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    @Test
    void createPatient_shouldGenerateMrn() {
        // Mock the native query for MRN generation
        when(entityManager.createNativeQuery(anyString())).thenReturn(nativeQuery);
        when(nativeQuery.setParameter(eq("tenantId"), any())).thenReturn(nativeQuery);
        when(nativeQuery.getSingleResult()).thenReturn(10000);

        // Mock save to return the patient with fields populated
        when(patientRepo.save(any(Patient.class))).thenAnswer(invocation -> {
            Patient p = invocation.getArgument(0);
            p.setId(1L);
            p.setUuid(UUID.randomUUID());
            return p;
        });

        CreatePatientRequest request = new CreatePatientRequest();
        request.setFirstName("Jane");
        request.setLastName("Smith");
        request.setDateOfBirth(LocalDate.of(1990, 6, 15));
        request.setSex("FEMALE");

        PatientDto result = patientService.createPatient(request);

        assertThat(result).isNotNull();
        assertThat(result.getMrn()).startsWith("PAT-");
        assertThat(result.getFirstName()).isEqualTo("Jane");
        assertThat(result.getLastName()).isEqualTo("Smith");
        assertThat(result.getUuid()).isNotNull();
        assertThat(result.isArchived()).isFalse();
    }

    @Test
    void createPatient_mrnIsUnique_forSequentialCalls() {
        // Mock the native query for MRN generation — return incrementing values
        when(entityManager.createNativeQuery(anyString())).thenReturn(nativeQuery);
        when(nativeQuery.setParameter(eq("tenantId"), any())).thenReturn(nativeQuery);
        when(nativeQuery.getSingleResult()).thenReturn(10000, 10001);

        when(patientRepo.save(any(Patient.class))).thenAnswer(invocation -> {
            Patient p = invocation.getArgument(0);
            p.setId(System.nanoTime()); // unique id
            p.setUuid(UUID.randomUUID());
            return p;
        });

        CreatePatientRequest req1 = buildRequest("Alice", "Brown", LocalDate.of(1985, 3, 20));
        CreatePatientRequest req2 = buildRequest("Bob", "Davis", LocalDate.of(1975, 11, 5));

        PatientDto p1 = patientService.createPatient(req1);
        PatientDto p2 = patientService.createPatient(req2);

        assertThat(p1.getMrn()).isNotEqualTo(p2.getMrn());
    }

    @Test
    void getPatient_returnsPatientDto() {
        UUID uuid = UUID.randomUUID();
        Patient patient = Patient.builder()
                .tenantId(1L)
                .mrn("PAT-10001")
                .firstName("James")
                .lastName("Wilson")
                .dob(LocalDate.of(1980, 1, 15))
                .sex("MALE")
                .status(Patient.PatientStatus.ACTIVE)
                .build();
        patient.setId(1L);
        patient.setUuid(uuid);

        when(patientRepo.findByTenantIdAndUuid(1L, uuid)).thenReturn(Optional.of(patient));

        PatientDto result = patientService.getPatient(uuid);

        assertThat(result).isNotNull();
        assertThat(result.getUuid()).isEqualTo(uuid);
        assertThat(result.getMrn()).isEqualTo("PAT-10001");
    }

    @Test
    void getPatient_notFound_shouldThrowException() {
        UUID uuid = UUID.randomUUID();
        when(patientRepo.findByTenantIdAndUuid(1L, uuid)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> patientService.getPatient(uuid))
                .isInstanceOf(PrimusException.class)
                .hasMessageContaining("Patient not found");
    }

    @Test
    void searchPatients_shouldReturnResults() {
        Patient patient = Patient.builder()
                .tenantId(1L)
                .mrn("PAT-10001")
                .firstName("James")
                .lastName("Wilson")
                .dob(LocalDate.of(1980, 1, 15))
                .sex("MALE")
                .status(Patient.PatientStatus.ACTIVE)
                .build();
        patient.setId(1L);
        patient.setUuid(UUID.randomUUID());

        PageRequest pageable = PageRequest.of(0, 20);
        when(patientRepo.searchByName(eq(1L), eq("James"), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(patient), pageable, 1));

        Page<PatientSearchResult> results = patientService.searchPatients("James", pageable);

        assertThat(results).isNotNull();
        assertThat(results.getContent()).isNotEmpty();
        PatientSearchResult first = results.getContent().get(0);
        assertThat(first.getFullName()).isNotBlank();
        assertThat(first.getMrn()).startsWith("PAT-");
    }

    @Test
    void listPatients_shouldReturnPagedResults() {
        Patient patient = Patient.builder()
                .tenantId(1L)
                .mrn("PAT-10001")
                .firstName("Jane")
                .lastName("Doe")
                .dob(LocalDate.of(1990, 5, 20))
                .sex("FEMALE")
                .status(Patient.PatientStatus.ACTIVE)
                .build();
        patient.setId(1L);
        patient.setUuid(UUID.randomUUID());

        PageRequest pageable = PageRequest.of(0, 20);
        when(patientRepo.findByTenantIdAndArchiveFalse(eq(1L), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(patient), pageable, 1));

        Page<PatientDto> page = patientService.listPatients(pageable);

        assertThat(page).isNotNull();
        assertThat(page.getContent()).isNotEmpty();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private CreatePatientRequest buildRequest(String first, String last, LocalDate dob) {
        CreatePatientRequest req = new CreatePatientRequest();
        req.setFirstName(first);
        req.setLastName(last);
        req.setDateOfBirth(dob);
        req.setSex("FEMALE");
        return req;
    }
}
