package com.thinkitive.primus.prescription.controller;

import com.thinkitive.primus.prescription.dto.*;
import com.thinkitive.primus.prescription.service.FormularyService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.thinkitive.primus.shared.security.Roles;

@RestController
@RequestMapping("/api/v1/formulary")
@RequiredArgsConstructor
@PreAuthorize(Roles.HAS_CLINICAL_ROLE)
public class FormularyController extends BaseController {

    private final FormularyService formularyService;

    // ── Formulary ─────────────────────────────────────────────────────────────

    /** GET /api/v1/formulary */
    @GetMapping
    public ResponseEntity<ApiResponse> getFormulary() {
        return ok(formularyService.getFormulary());
    }

    /** GET /api/v1/formulary/search?query=... */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse> searchFormulary(@RequestParam String query) {
        return ok(formularyService.searchFormulary(query));
    }

    /** POST /api/v1/formulary */
    @PostMapping
    public ResponseEntity<ApiResponse> createFormularyEntry(
            @Valid @RequestBody CreateFormularyRequest request) {
        return created(formularyService.createFormularyEntry(request), "Formulary entry created");
    }

    // ── Drug Intolerances ─────────────────────────────────────────────────────

    /** GET /api/v1/formulary/patient/{patientId}/intolerances */
    @GetMapping("/patient/{patientId}/intolerances")
    public ResponseEntity<ApiResponse> getPatientIntolerances(@PathVariable Long patientId) {
        return ok(formularyService.getPatientIntolerances(patientId));
    }

    /** POST /api/v1/formulary/patient/{patientId}/intolerances */
    @PostMapping("/patient/{patientId}/intolerances")
    public ResponseEntity<ApiResponse> addPatientIntolerance(
            @PathVariable Long patientId,
            @Valid @RequestBody AddDrugIntoleranceRequest request) {
        return created(formularyService.addPatientIntolerance(patientId, request), "Drug intolerance recorded");
    }
}
