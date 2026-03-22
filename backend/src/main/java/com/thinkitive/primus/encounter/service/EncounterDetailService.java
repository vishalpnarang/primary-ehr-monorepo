package com.thinkitive.primus.encounter.service;

import com.thinkitive.primus.encounter.dto.*;

import java.util.List;

public interface EncounterDetailService {

    // ── Diagnoses ─────────────────────────────────────────────────────────────
    List<EncounterDiagnosisDto> getDiagnoses(String encounterUuid);

    EncounterDiagnosisDto addDiagnosis(String encounterUuid, AddDiagnosisRequest request);

    void removeDiagnosis(String encounterUuid, String diagnosisUuid);

    // ── Procedures ────────────────────────────────────────────────────────────
    List<EncounterProcedureDto> getProcedures(String encounterUuid);

    EncounterProcedureDto addProcedure(String encounterUuid, AddProcedureRequest request);

    // ── Comments ──────────────────────────────────────────────────────────────
    List<EncounterCommentDto> getComments(String encounterUuid);

    EncounterCommentDto addComment(String encounterUuid, AddCommentRequest request);

    // ── Visit Tracking ────────────────────────────────────────────────────────
    PatientVisitDto getVisitByEncounter(String encounterUuid);

    PatientVisitDto createVisit(String encounterUuid, CreateVisitRequest request);

    PatientVisitDto updateVisitStatus(String encounterUuid, UpdateVisitStatusRequest request);
}
