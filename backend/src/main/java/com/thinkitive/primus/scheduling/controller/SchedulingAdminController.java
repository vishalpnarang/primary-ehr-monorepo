package com.thinkitive.primus.scheduling.controller;

import com.thinkitive.primus.scheduling.dto.*;
import com.thinkitive.primus.scheduling.entity.*;
import com.thinkitive.primus.scheduling.service.SchedulingAdminService;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Admin controller for scheduling configuration:
 * appointment types, provider availability, block days, and status transitions.
 *
 * Base path: /api/v1/scheduling/admin
 */
@RestController
@RequestMapping("/api/v1/scheduling/admin")
@RequiredArgsConstructor
public class SchedulingAdminController extends BaseController {

    private final SchedulingAdminService schedulingAdminService;

    // ── Appointment Types ─────────────────────────────────────────────────────

    /** GET /api/v1/scheduling/admin/appointment-types */
    @GetMapping("/appointment-types")
    public ResponseEntity<ApiResponse> getAppointmentTypes() {
        Long tenantId = TenantContext.getTenantId();
        List<AppointmentType> result = schedulingAdminService.getAppointmentTypes(tenantId);
        return ok(result);
    }

    /** POST /api/v1/scheduling/admin/appointment-types */
    @PostMapping("/appointment-types")
    public ResponseEntity<ApiResponse> createAppointmentType(
            @Valid @RequestBody AppointmentTypeRequest request) {
        Long tenantId = TenantContext.getTenantId();
        AppointmentType saved = schedulingAdminService.createAppointmentType(request, tenantId);
        return created(saved, "Appointment type created");
    }

    /** PUT /api/v1/scheduling/admin/appointment-types/{id} */
    @PutMapping("/appointment-types/{id}")
    public ResponseEntity<ApiResponse> updateAppointmentType(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentTypeRequest request) {
        Long tenantId = TenantContext.getTenantId();
        AppointmentType updated = schedulingAdminService.updateAppointmentType(id, request, tenantId);
        return ok(updated, "Appointment type updated");
    }

    // ── Provider Availability ─────────────────────────────────────────────────

    /** GET /api/v1/scheduling/admin/availability/{providerId} */
    @GetMapping("/availability/{providerId}")
    public ResponseEntity<ApiResponse> getProviderAvailability(@PathVariable String providerId) {
        Long tenantId = TenantContext.getTenantId();
        List<ProviderAvailability> result = schedulingAdminService.getProviderAvailability(providerId, tenantId);
        return ok(result);
    }

    /** POST /api/v1/scheduling/admin/availability */
    @PostMapping("/availability")
    public ResponseEntity<ApiResponse> setProviderAvailability(
            @Valid @RequestBody AvailabilityRequest request) {
        Long tenantId = TenantContext.getTenantId();
        ProviderAvailability saved = schedulingAdminService.setProviderAvailability(request, tenantId);
        return ok(saved, "Provider availability updated");
    }

    // ── Block Days ────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/scheduling/admin/block-days/{providerId}?from=2026-01-01&to=2026-01-31
     * Both date params are optional; omitting them returns all block days for the provider.
     */
    @GetMapping("/block-days/{providerId}")
    public ResponseEntity<ApiResponse> getBlockDays(
            @PathVariable String providerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Long tenantId = TenantContext.getTenantId();
        List<BlockDay> result = schedulingAdminService.getBlockDays(providerId, from, to, tenantId);
        return ok(result);
    }

    /** POST /api/v1/scheduling/admin/block-days */
    @PostMapping("/block-days")
    public ResponseEntity<ApiResponse> createBlockDay(@Valid @RequestBody BlockDayRequest request) {
        Long tenantId = TenantContext.getTenantId();
        BlockDay saved = schedulingAdminService.createBlockDay(request, tenantId);
        return created(saved, "Block day created");
    }

    /** DELETE /api/v1/scheduling/admin/block-days/{id} */
    @DeleteMapping("/block-days/{id}")
    public ResponseEntity<ApiResponse> deleteBlockDay(@PathVariable Long id) {
        Long tenantId = TenantContext.getTenantId();
        schedulingAdminService.deleteBlockDay(id, tenantId);
        return ok(null, "Block day deleted");
    }

    // ── Status Configurations ─────────────────────────────────────────────────

    /** GET /api/v1/scheduling/admin/status-configs */
    @GetMapping("/status-configs")
    public ResponseEntity<ApiResponse> getStatusConfigurations() {
        Long tenantId = TenantContext.getTenantId();
        List<StatusConfiguration> result = schedulingAdminService.getStatusConfigurations(tenantId);
        return ok(result);
    }

    /** POST /api/v1/scheduling/admin/status-configs */
    @PostMapping("/status-configs")
    public ResponseEntity<ApiResponse> createStatusConfiguration(
            @Valid @RequestBody StatusConfigRequest request) {
        Long tenantId = TenantContext.getTenantId();
        StatusConfiguration saved = schedulingAdminService.createStatusConfiguration(request, tenantId);
        return created(saved, "Status configuration created");
    }
}
