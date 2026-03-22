package com.thinkitive.primus.patient.controller;

import com.thinkitive.primus.patient.dto.*;
import com.thinkitive.primus.patient.entity.*;
import com.thinkitive.primus.patient.service.PatientHistoryService;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.thinkitive.primus.shared.security.Roles;

import java.util.List;

/**
 * Consolidated controller for all patient clinical history sub-resources:
 * family history, social history, surgical history, medical history,
 * emergency contacts, and patient flags.
 *
 * Base path: /api/v1/patients/{patientId}/history
 */
@RestController
@RequestMapping("/api/v1/patients/{patientId}/history")
@RequiredArgsConstructor
@PreAuthorize(Roles.HAS_CLINICAL_ROLE)
public class PatientHistoryController extends BaseController {

    private final PatientHistoryService patientHistoryService;

    // ── Family History ────────────────────────────────────────────────────────

    /** GET /api/v1/patients/{patientId}/history/family */
    @GetMapping("/family")
    public ResponseEntity<ApiResponse> getFamilyHistory(@PathVariable Long patientId) {
        Long tenantId = TenantContext.getTenantId();
        List<FamilyHistory> result = patientHistoryService.getFamilyHistory(patientId, tenantId);
        return ok(result);
    }

    /** POST /api/v1/patients/{patientId}/history/family */
    @PostMapping("/family")
    public ResponseEntity<ApiResponse> addFamilyHistory(
            @PathVariable Long patientId,
            @Valid @RequestBody FamilyHistoryRequest request) {
        Long tenantId = TenantContext.getTenantId();
        FamilyHistory saved = patientHistoryService.addFamilyHistory(patientId, request, tenantId);
        return created(saved, "Family history entry added");
    }

    // ── Social History ────────────────────────────────────────────────────────

    /** GET /api/v1/patients/{patientId}/history/social */
    @GetMapping("/social")
    public ResponseEntity<ApiResponse> getSocialHistory(@PathVariable Long patientId) {
        Long tenantId = TenantContext.getTenantId();
        SocialHistory result = patientHistoryService.getSocialHistory(patientId, tenantId);
        return ok(result);
    }

    /** PUT /api/v1/patients/{patientId}/history/social */
    @PutMapping("/social")
    public ResponseEntity<ApiResponse> saveSocialHistory(
            @PathVariable Long patientId,
            @Valid @RequestBody SocialHistoryRequest request) {
        Long tenantId = TenantContext.getTenantId();
        SocialHistory saved = patientHistoryService.saveSocialHistory(patientId, request, tenantId);
        return ok(saved, "Social history updated");
    }

    // ── Past Surgical History ─────────────────────────────────────────────────

    /** GET /api/v1/patients/{patientId}/history/surgical */
    @GetMapping("/surgical")
    public ResponseEntity<ApiResponse> getPastSurgicalHistory(@PathVariable Long patientId) {
        Long tenantId = TenantContext.getTenantId();
        List<PastSurgicalHistory> result = patientHistoryService.getPastSurgicalHistory(patientId, tenantId);
        return ok(result);
    }

    /** POST /api/v1/patients/{patientId}/history/surgical */
    @PostMapping("/surgical")
    public ResponseEntity<ApiResponse> addPastSurgicalHistory(
            @PathVariable Long patientId,
            @Valid @RequestBody PastSurgicalHistoryRequest request) {
        Long tenantId = TenantContext.getTenantId();
        PastSurgicalHistory saved = patientHistoryService.addPastSurgicalHistory(patientId, request, tenantId);
        return created(saved, "Surgical history entry added");
    }

    // ── Past Medical History ──────────────────────────────────────────────────

    /** GET /api/v1/patients/{patientId}/history/medical */
    @GetMapping("/medical")
    public ResponseEntity<ApiResponse> getPastMedicalHistory(@PathVariable Long patientId) {
        Long tenantId = TenantContext.getTenantId();
        List<PastMedicalHistory> result = patientHistoryService.getPastMedicalHistory(patientId, tenantId);
        return ok(result);
    }

    /** POST /api/v1/patients/{patientId}/history/medical */
    @PostMapping("/medical")
    public ResponseEntity<ApiResponse> addPastMedicalHistory(
            @PathVariable Long patientId,
            @Valid @RequestBody PastMedicalHistoryRequest request) {
        Long tenantId = TenantContext.getTenantId();
        PastMedicalHistory saved = patientHistoryService.addPastMedicalHistory(patientId, request, tenantId);
        return created(saved, "Medical history entry added");
    }

    // ── Emergency Contacts ────────────────────────────────────────────────────

    /** GET /api/v1/patients/{patientId}/history/emergency-contacts */
    @GetMapping("/emergency-contacts")
    public ResponseEntity<ApiResponse> getEmergencyContacts(@PathVariable Long patientId) {
        Long tenantId = TenantContext.getTenantId();
        List<EmergencyContact> result = patientHistoryService.getEmergencyContacts(patientId, tenantId);
        return ok(result);
    }

    /** POST /api/v1/patients/{patientId}/history/emergency-contacts */
    @PostMapping("/emergency-contacts")
    public ResponseEntity<ApiResponse> addEmergencyContact(
            @PathVariable Long patientId,
            @Valid @RequestBody EmergencyContactRequest request) {
        Long tenantId = TenantContext.getTenantId();
        EmergencyContact saved = patientHistoryService.addEmergencyContact(patientId, request, tenantId);
        return created(saved, "Emergency contact added");
    }

    // ── Patient Flags ─────────────────────────────────────────────────────────

    /** GET /api/v1/patients/{patientId}/history/flags */
    @GetMapping("/flags")
    public ResponseEntity<ApiResponse> getPatientFlags(@PathVariable Long patientId) {
        Long tenantId = TenantContext.getTenantId();
        List<PatientFlag> result = patientHistoryService.getPatientFlags(patientId, tenantId);
        return ok(result);
    }

    /** POST /api/v1/patients/{patientId}/history/flags */
    @PostMapping("/flags")
    public ResponseEntity<ApiResponse> addPatientFlag(
            @PathVariable Long patientId,
            @Valid @RequestBody PatientFlagRequest request) {
        Long tenantId = TenantContext.getTenantId();
        PatientFlag saved = patientHistoryService.addPatientFlag(patientId, request, tenantId);
        return created(saved, "Patient flag added");
    }

    // ── Soft Delete ───────────────────────────────────────────────────────────

    /** DELETE /api/v1/patients/{patientId}/history/{recordId} */
    @DeleteMapping("/{recordId}")
    public ResponseEntity<ApiResponse> deleteRecord(
            @PathVariable Long patientId,
            @PathVariable Long recordId) {
        Long tenantId = TenantContext.getTenantId();
        patientHistoryService.deleteRecord(recordId, tenantId);
        return ok(null, "Record archived");
    }
}
