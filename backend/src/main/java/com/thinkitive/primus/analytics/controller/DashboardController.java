package com.thinkitive.primus.analytics.controller;

import com.thinkitive.primus.analytics.service.DashboardService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController extends BaseController {

    private final DashboardService dashboardService;

    /** GET /api/v1/dashboard/provider?providerId= */
    @GetMapping("/provider")
    public ResponseEntity<ApiResponse> getProviderDashboard(
            @RequestParam(required = false) String providerId) {
        return ok(dashboardService.getProviderDashboard(providerId));
    }

    /** GET /api/v1/dashboard/nurse */
    @GetMapping("/nurse")
    public ResponseEntity<ApiResponse> getNurseDashboard() {
        return ok(dashboardService.getNurseDashboard());
    }

    /** GET /api/v1/dashboard/frontdesk */
    @GetMapping("/frontdesk")
    public ResponseEntity<ApiResponse> getFrontDeskDashboard() {
        return ok(dashboardService.getFrontDeskDashboard());
    }

    /** GET /api/v1/dashboard/billing */
    @GetMapping("/billing")
    public ResponseEntity<ApiResponse> getBillingDashboard() {
        return ok(dashboardService.getBillingDashboard());
    }

    /** GET /api/v1/dashboard/admin */
    @GetMapping("/admin")
    public ResponseEntity<ApiResponse> getAdminDashboard() {
        return ok(dashboardService.getAdminDashboard());
    }
}
