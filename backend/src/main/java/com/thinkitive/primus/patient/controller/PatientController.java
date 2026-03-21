package com.thinkitive.primus.patient.controller;

import com.thinkitive.primus.patient.dto.*;
import com.thinkitive.primus.patient.service.PatientService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import com.thinkitive.primus.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientController extends BaseController {

    private final PatientService patientService;

    /** POST /api/v1/patients — create a new patient */
    @PostMapping
    public ResponseEntity<ApiResponse> createPatient(@Valid @RequestBody CreatePatientRequest request) {
        PatientDto dto = patientService.createPatient(request);
        return created(dto, "Patient record created successfully");
    }

    /** GET /api/v1/patients/{uuid} — get patient by UUID */
    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse> getPatient(@PathVariable UUID uuid) {
        return ok(patientService.getPatient(uuid));
    }

    /** PUT /api/v1/patients/{uuid} — update patient demographics */
    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse> updatePatient(
            @PathVariable UUID uuid,
            @Valid @RequestBody UpdatePatientRequest request) {
        return ok(patientService.updatePatient(uuid, request), "Patient updated");
    }

    /** DELETE /api/v1/patients/{uuid} — soft-delete (archive) patient */
    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse> deletePatient(@PathVariable UUID uuid) {
        patientService.deletePatient(uuid);
        return ok(null, "Patient archived");
    }

    /** GET /api/v1/patients — paginated list */
    @GetMapping
    public ResponseEntity<ApiResponse> listPatients(@PageableDefault(size = 20) Pageable pageable) {
        return ok(PageResponse.from(patientService.listPatients(pageable)));
    }

    /** GET /api/v1/patients/search?q= — search by name, MRN, DOB, phone */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse> searchPatients(
            @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable) {
        return ok(PageResponse.from(patientService.searchPatients(q, pageable)));
    }

    /** POST /api/v1/patients/{uuid}/allergies — add allergy */
    @PostMapping("/{uuid}/allergies")
    public ResponseEntity<ApiResponse> addAllergy(
            @PathVariable UUID uuid,
            @Valid @RequestBody AllergyRequest request) {
        return created(patientService.addAllergy(uuid, request), "Allergy recorded");
    }

    /** POST /api/v1/patients/{uuid}/problems — add problem to problem list */
    @PostMapping("/{uuid}/problems")
    public ResponseEntity<ApiResponse> addProblem(
            @PathVariable UUID uuid,
            @Valid @RequestBody ProblemRequest request) {
        return created(patientService.addProblem(uuid, request), "Problem added to list");
    }

    /** POST /api/v1/patients/{uuid}/vitals — record vital signs */
    @PostMapping("/{uuid}/vitals")
    public ResponseEntity<ApiResponse> recordVitals(
            @PathVariable UUID uuid,
            @Valid @RequestBody VitalsRequest request) {
        return created(patientService.recordVitals(uuid, request), "Vitals recorded");
    }

    /** GET /api/v1/patients/{uuid}/timeline — clinical timeline */
    @GetMapping("/{uuid}/timeline")
    public ResponseEntity<ApiResponse> getTimeline(@PathVariable UUID uuid) {
        return ok(patientService.getTimeline(uuid));
    }
}
