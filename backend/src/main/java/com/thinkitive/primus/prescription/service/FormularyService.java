package com.thinkitive.primus.prescription.service;

import com.thinkitive.primus.prescription.dto.*;

import java.util.List;

public interface FormularyService {

    List<FormularyDto> getFormulary();

    List<FormularyDto> searchFormulary(String query);

    FormularyDto createFormularyEntry(CreateFormularyRequest request);

    List<DrugIntoleranceDto> getPatientIntolerances(Long patientId);

    DrugIntoleranceDto addPatientIntolerance(Long patientId, AddDrugIntoleranceRequest request);
}
