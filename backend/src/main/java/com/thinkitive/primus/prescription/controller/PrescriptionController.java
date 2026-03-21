package com.thinkitive.primus.prescription.controller;

import com.thinkitive.primus.prescription.dto.*;
import com.thinkitive.primus.prescription.service.PrescriptionService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController extends BaseController {

    private final PrescriptionService prescriptionService;

    /** POST /api/v1/prescriptions */
    @PostMapping
    public ResponseEntity<ApiResponse> createPrescription(@Valid @RequestBody CreatePrescriptionRequest request) {
        return created(prescriptionService.createPrescription(request), "Prescription created");
    }

    /** GET /api/v1/prescriptions/{uuid} */
    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse> getPrescription(@PathVariable UUID uuid) {
        return ok(prescriptionService.getPrescription(uuid));
    }

    /** GET /api/v1/prescriptions/patient/{patientUuid} */
    @GetMapping("/patient/{patientUuid}")
    public ResponseEntity<ApiResponse> getPrescriptionsByPatient(@PathVariable UUID patientUuid) {
        return ok(prescriptionService.getPrescriptionsByPatient(patientUuid));
    }

    /** POST /api/v1/prescriptions/{uuid}/send — transmit to pharmacy via ScriptSure */
    @PostMapping("/{uuid}/send")
    public ResponseEntity<ApiResponse> sendToPharmacy(@PathVariable UUID uuid) {
        return ok(prescriptionService.sendToPharmacy(uuid), "Prescription sent to pharmacy");
    }

    /** POST /api/v1/prescriptions/{uuid}/cancel */
    @PostMapping("/{uuid}/cancel")
    public ResponseEntity<ApiResponse> cancelPrescription(@PathVariable UUID uuid) {
        return ok(prescriptionService.cancelPrescription(uuid), "Prescription cancelled");
    }

    /** POST /api/v1/prescriptions/interaction-check */
    @PostMapping("/interaction-check")
    public ResponseEntity<ApiResponse> checkInteractions(@Valid @RequestBody InteractionCheckRequest request) {
        return ok(prescriptionService.checkInteractions(request));
    }
}
