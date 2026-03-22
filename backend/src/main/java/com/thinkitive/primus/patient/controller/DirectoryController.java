package com.thinkitive.primus.patient.controller;

import com.thinkitive.primus.patient.dto.*;
import com.thinkitive.primus.patient.entity.*;
import com.thinkitive.primus.patient.service.DirectoryService;
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
 * Directory controller for pharmacies and external contacts (specialists, labs, facilities).
 * Also handles patient–pharmacy linkage.
 *
 * Base path: /api/v1/directory
 */
@RestController
@RequestMapping("/api/v1/directory")
@RequiredArgsConstructor
@PreAuthorize(Roles.HAS_ANY_STAFF_ROLE)
public class DirectoryController extends BaseController {

    private final DirectoryService directoryService;

    // ── Pharmacies ────────────────────────────────────────────────────────────

    /** GET /api/v1/directory/pharmacies */
    @GetMapping("/pharmacies")
    public ResponseEntity<ApiResponse> getPharmacies() {
        Long tenantId = TenantContext.getTenantId();
        List<Pharmacy> result = directoryService.getPharmacies(tenantId);
        return ok(result);
    }

    /** POST /api/v1/directory/pharmacies */
    @PostMapping("/pharmacies")
    public ResponseEntity<ApiResponse> createPharmacy(@Valid @RequestBody PharmacyRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Pharmacy saved = directoryService.createPharmacy(request, tenantId);
        return created(saved, "Pharmacy created");
    }

    // ── Contacts ──────────────────────────────────────────────────────────────

    /** GET /api/v1/directory/contacts?type=SPECIALIST */
    @GetMapping("/contacts")
    public ResponseEntity<ApiResponse> getContacts(
            @RequestParam(required = false) String type) {
        Long tenantId = TenantContext.getTenantId();
        List<Contact> result = directoryService.getContacts(type, tenantId);
        return ok(result);
    }

    /** POST /api/v1/directory/contacts */
    @PostMapping("/contacts")
    public ResponseEntity<ApiResponse> createContact(@Valid @RequestBody ContactRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Contact saved = directoryService.createContact(request, tenantId);
        return created(saved, "Contact created");
    }

    // ── Patient–Pharmacy Link ─────────────────────────────────────────────────

    /** POST /api/v1/directory/patients/{patientId}/pharmacies/{pharmacyId}?preferred=true */
    @PostMapping("/patients/{patientId}/pharmacies/{pharmacyId}")
    public ResponseEntity<ApiResponse> linkPharmacy(
            @PathVariable Long patientId,
            @PathVariable Long pharmacyId,
            @RequestParam(defaultValue = "false") boolean preferred) {
        Long tenantId = TenantContext.getTenantId();
        PatientLinkedPharmacy link = directoryService.linkPharmacy(patientId, pharmacyId, preferred, tenantId);
        return created(link, "Pharmacy linked to patient");
    }

    /** GET /api/v1/directory/patients/{patientId}/pharmacies */
    @GetMapping("/patients/{patientId}/pharmacies")
    public ResponseEntity<ApiResponse> getPatientPharmacies(@PathVariable Long patientId) {
        Long tenantId = TenantContext.getTenantId();
        List<PatientLinkedPharmacy> result = directoryService.getPatientPharmacies(patientId, tenantId);
        return ok(result);
    }
}
