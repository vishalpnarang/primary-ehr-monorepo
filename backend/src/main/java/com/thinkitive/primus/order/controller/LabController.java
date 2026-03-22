package com.thinkitive.primus.order.controller;

import com.thinkitive.primus.order.dto.*;
import com.thinkitive.primus.order.service.LabService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/labs")
@RequiredArgsConstructor
public class LabController extends BaseController {

    private final LabService labService;

    // ── Order Sets ────────────────────────────────────────────────────────────

    /** GET /api/v1/labs/order-sets */
    @GetMapping("/order-sets")
    public ResponseEntity<ApiResponse> getOrderSets() {
        return ok(labService.getOrderSets());
    }

    /** POST /api/v1/labs/order-sets */
    @PostMapping("/order-sets")
    public ResponseEntity<ApiResponse> createOrderSet(
            @Valid @RequestBody CreateLabOrderSetRequest request) {
        return created(labService.createOrderSet(request), "Lab order set created");
    }

    // ── Catalog ───────────────────────────────────────────────────────────────

    /** GET /api/v1/labs/catalog */
    @GetMapping("/catalog")
    public ResponseEntity<ApiResponse> getLabCatalog() {
        return ok(labService.getLabCatalog());
    }

    /** GET /api/v1/labs/catalog/search?query=... */
    @GetMapping("/catalog/search")
    public ResponseEntity<ApiResponse> searchCatalog(@RequestParam String query) {
        return ok(labService.searchCatalog(query));
    }

    // ── POC Tests ─────────────────────────────────────────────────────────────

    /** GET /api/v1/labs/poc-tests */
    @GetMapping("/poc-tests")
    public ResponseEntity<ApiResponse> getPocTests() {
        return ok(labService.getPocTests());
    }

    /** POST /api/v1/labs/poc-tests */
    @PostMapping("/poc-tests")
    public ResponseEntity<ApiResponse> createPocTest(
            @Valid @RequestBody CreatePocTestRequest request) {
        return created(labService.createPocTest(request), "POC test created");
    }

    // ── POC Results ───────────────────────────────────────────────────────────

    /** POST /api/v1/labs/poc-results */
    @PostMapping("/poc-results")
    public ResponseEntity<ApiResponse> recordPocResult(
            @Valid @RequestBody RecordPocResultRequest request) {
        return created(labService.recordPocResult(request), "POC result recorded");
    }

    /** GET /api/v1/labs/poc-results/patient/{patientId} */
    @GetMapping("/poc-results/patient/{patientId}")
    public ResponseEntity<ApiResponse> getPatientPocResults(@PathVariable Long patientId) {
        return ok(labService.getPatientPocResults(patientId));
    }

    // ── Imaging ───────────────────────────────────────────────────────────────

    /** GET /api/v1/labs/imaging/{patientId} */
    @GetMapping("/imaging/{patientId}")
    public ResponseEntity<ApiResponse> getImagingResults(@PathVariable Long patientId) {
        return ok(labService.getImagingResults(patientId));
    }

    /** POST /api/v1/labs/imaging */
    @PostMapping("/imaging")
    public ResponseEntity<ApiResponse> addImagingResult(
            @Valid @RequestBody AddImagingResultRequest request) {
        return created(labService.addImagingResult(request), "Imaging result added");
    }
}
