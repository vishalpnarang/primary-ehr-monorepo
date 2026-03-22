package com.thinkitive.primus.encounter.controller;

import com.thinkitive.primus.encounter.dto.*;
import com.thinkitive.primus.encounter.service.EncounterDetailService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Encounter detail sub-resources — mounted under /api/v1/encounters/{encounterUuid}.
 * Keeps the primary EncounterController focused on the encounter lifecycle (create/update/sign).
 */
@RestController
@RequestMapping("/api/v1/encounters/{encounterUuid}")
@RequiredArgsConstructor
public class EncounterDetailController extends BaseController {

    private final EncounterDetailService encounterDetailService;

    // ── Diagnoses ─────────────────────────────────────────────────────────────

    /** GET /api/v1/encounters/{encounterUuid}/diagnoses */
    @GetMapping("/diagnoses")
    public ResponseEntity<ApiResponse> getDiagnoses(@PathVariable String encounterUuid) {
        return ok(encounterDetailService.getDiagnoses(encounterUuid));
    }

    /** POST /api/v1/encounters/{encounterUuid}/diagnoses */
    @PostMapping("/diagnoses")
    public ResponseEntity<ApiResponse> addDiagnosis(
            @PathVariable String encounterUuid,
            @Valid @RequestBody AddDiagnosisRequest request) {
        return created(encounterDetailService.addDiagnosis(encounterUuid, request), "Diagnosis added");
    }

    /** DELETE /api/v1/encounters/{encounterUuid}/diagnoses/{diagnosisUuid} */
    @DeleteMapping("/diagnoses/{diagnosisUuid}")
    public ResponseEntity<ApiResponse> removeDiagnosis(
            @PathVariable String encounterUuid,
            @PathVariable String diagnosisUuid) {
        encounterDetailService.removeDiagnosis(encounterUuid, diagnosisUuid);
        return noContent();
    }

    // ── Procedures ────────────────────────────────────────────────────────────

    /** GET /api/v1/encounters/{encounterUuid}/procedures */
    @GetMapping("/procedures")
    public ResponseEntity<ApiResponse> getProcedures(@PathVariable String encounterUuid) {
        return ok(encounterDetailService.getProcedures(encounterUuid));
    }

    /** POST /api/v1/encounters/{encounterUuid}/procedures */
    @PostMapping("/procedures")
    public ResponseEntity<ApiResponse> addProcedure(
            @PathVariable String encounterUuid,
            @Valid @RequestBody AddProcedureRequest request) {
        return created(encounterDetailService.addProcedure(encounterUuid, request), "Procedure added");
    }

    // ── Comments ──────────────────────────────────────────────────────────────

    /** GET /api/v1/encounters/{encounterUuid}/comments */
    @GetMapping("/comments")
    public ResponseEntity<ApiResponse> getComments(@PathVariable String encounterUuid) {
        return ok(encounterDetailService.getComments(encounterUuid));
    }

    /** POST /api/v1/encounters/{encounterUuid}/comments */
    @PostMapping("/comments")
    public ResponseEntity<ApiResponse> addComment(
            @PathVariable String encounterUuid,
            @Valid @RequestBody AddCommentRequest request) {
        return created(encounterDetailService.addComment(encounterUuid, request), "Comment added");
    }

    // ── Visit Tracking ────────────────────────────────────────────────────────

    /** GET /api/v1/encounters/{encounterUuid}/visit */
    @GetMapping("/visit")
    public ResponseEntity<ApiResponse> getVisit(@PathVariable String encounterUuid) {
        return ok(encounterDetailService.getVisitByEncounter(encounterUuid));
    }

    /** POST /api/v1/encounters/{encounterUuid}/visit — create visit record */
    @PostMapping("/visit")
    public ResponseEntity<ApiResponse> createVisit(
            @PathVariable String encounterUuid,
            @Valid @RequestBody CreateVisitRequest request) {
        return created(encounterDetailService.createVisit(encounterUuid, request), "Visit created");
    }

    /** PUT /api/v1/encounters/{encounterUuid}/visit/status — advance visit status */
    @PutMapping("/visit/status")
    public ResponseEntity<ApiResponse> updateVisitStatus(
            @PathVariable String encounterUuid,
            @Valid @RequestBody UpdateVisitStatusRequest request) {
        return ok(encounterDetailService.updateVisitStatus(encounterUuid, request), "Visit status updated");
    }
}
