package com.thinkitive.primus.patient.service;

import com.thinkitive.primus.patient.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PatientService {

    PatientDto createPatient(CreatePatientRequest request);

    PatientDto getPatient(String uuid);

    PatientDto updatePatient(String uuid, UpdatePatientRequest request);

    void deletePatient(String uuid);

    Page<PatientSearchResult> searchPatients(String query, Pageable pageable);

    Page<PatientDto> listPatients(Pageable pageable);

    AllergyDto addAllergy(String patientUuid, AllergyRequest request);

    ProblemDto addProblem(String patientUuid, ProblemRequest request);

    VitalsDto recordVitals(String patientUuid, VitalsRequest request);

    List<TimelineEventDto> getTimeline(String patientUuid);
}
