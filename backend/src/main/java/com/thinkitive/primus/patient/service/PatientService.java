package com.thinkitive.primus.patient.service;

import com.thinkitive.primus.patient.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface PatientService {

    PatientDto createPatient(CreatePatientRequest request);

    PatientDto getPatient(UUID uuid);

    PatientDto updatePatient(UUID uuid, UpdatePatientRequest request);

    void deletePatient(UUID uuid);

    Page<PatientSearchResult> searchPatients(String query, Pageable pageable);

    Page<PatientDto> listPatients(Pageable pageable);

    AllergyDto addAllergy(UUID patientUuid, AllergyRequest request);

    ProblemDto addProblem(UUID patientUuid, ProblemRequest request);

    VitalsDto recordVitals(UUID patientUuid, VitalsRequest request);

    List<TimelineEventDto> getTimeline(UUID patientUuid);
}
