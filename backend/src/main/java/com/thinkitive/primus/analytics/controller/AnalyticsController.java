package com.thinkitive.primus.analytics.controller;

import com.thinkitive.primus.analytics.dto.*;
import com.thinkitive.primus.analytics.service.AnalyticsService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.thinkitive.primus.shared.security.Roles;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@PreAuthorize(Roles.HAS_ADMIN_ROLE)
public class AnalyticsController extends BaseController {

    private final AnalyticsService analyticsService;

    // ── Dashboards ────────────────────────────────────────────────────────────

    /** GET /api/v1/analytics/dashboards */
    @GetMapping("/dashboards")
    public ResponseEntity<ApiResponse> getDashboards() {
        return ok(analyticsService.getDashboards());
    }

    /** POST /api/v1/analytics/dashboards */
    @PostMapping("/dashboards")
    public ResponseEntity<ApiResponse> createDashboard(
            @Valid @RequestBody CreateDashboardRequest request) {
        return created(analyticsService.createDashboard(request), "Dashboard created");
    }

    // ── Reports ───────────────────────────────────────────────────────────────

    /** GET /api/v1/analytics/reports */
    @GetMapping("/reports")
    public ResponseEntity<ApiResponse> getReports() {
        return ok(analyticsService.getReports());
    }

    /** POST /api/v1/analytics/reports */
    @PostMapping("/reports")
    public ResponseEntity<ApiResponse> createReport(
            @Valid @RequestBody CreateReportRequest request) {
        return created(analyticsService.createReport(request), "Report created");
    }

    /** POST /api/v1/analytics/reports/{id}/run */
    @PostMapping("/reports/{id}/run")
    public ResponseEntity<ApiResponse> runReport(@PathVariable String id) {
        return ok(analyticsService.runReport(id), "Report executed");
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    /** GET /api/v1/analytics/stats/patient-volume */
    @GetMapping("/stats/patient-volume")
    public ResponseEntity<ApiResponse> getPatientVolumeStats() {
        return ok(analyticsService.getPatientVolumeStats());
    }

    /** GET /api/v1/analytics/stats/appointment-utilization */
    @GetMapping("/stats/appointment-utilization")
    public ResponseEntity<ApiResponse> getAppointmentUtilization() {
        return ok(analyticsService.getAppointmentUtilization());
    }

    /** GET /api/v1/analytics/stats/revenue */
    @GetMapping("/stats/revenue")
    public ResponseEntity<ApiResponse> getRevenueBreakdown() {
        return ok(analyticsService.getRevenueBreakdown());
    }
}
