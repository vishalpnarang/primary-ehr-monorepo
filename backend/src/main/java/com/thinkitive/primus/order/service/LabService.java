package com.thinkitive.primus.order.service;

import com.thinkitive.primus.order.dto.*;

import java.util.List;

public interface LabService {

    // ── Order Sets ────────────────────────────────────────────────────────────
    List<LabOrderSetDto> getOrderSets();

    LabOrderSetDto createOrderSet(CreateLabOrderSetRequest request);

    // ── Lab Catalog ───────────────────────────────────────────────────────────
    List<LabCatalogDto> getLabCatalog();

    List<LabCatalogDto> searchCatalog(String query);

    // ── POC Tests ─────────────────────────────────────────────────────────────
    PocTestDto createPocTest(CreatePocTestRequest request);

    List<PocTestDto> getPocTests();

    // ── POC Results ───────────────────────────────────────────────────────────
    PocResultDto recordPocResult(RecordPocResultRequest request);

    List<PocResultDto> getPatientPocResults(Long patientId);

    // ── Imaging ───────────────────────────────────────────────────────────────
    List<ImagingResultDto> getImagingResults(Long patientId);

    ImagingResultDto addImagingResult(AddImagingResultRequest request);
}
