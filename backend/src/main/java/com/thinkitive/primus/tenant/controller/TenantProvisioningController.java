package com.thinkitive.primus.tenant.controller;

import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import com.thinkitive.primus.shared.security.Roles;
import com.thinkitive.primus.tenant.dto.CreateTenantRequest;
import com.thinkitive.primus.tenant.service.TenantProvisioningService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Tenant provisioning — super_admin only.
 *
 * <p>Creates a new tenant with full schema isolation:
 * <ol>
 *   <li>Creates tenant record in public schema</li>
 *   <li>Creates PostgreSQL schema {@code tenant_{id}}</li>
 *   <li>Runs all Liquibase migrations in the new schema</li>
 *   <li>Seeds default roles, features, and permissions</li>
 *   <li>Returns tenant details including subdomain for CloudFront mapping</li>
 * </ol>
 */
@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
@PreAuthorize(Roles.HAS_SUPER_ADMIN_ROLE)
public class TenantProvisioningController extends BaseController {

    private final TenantProvisioningService provisioningService;

    /** POST /api/v1/tenants — provision a new tenant with schema isolation */
    @PostMapping
    public ResponseEntity<ApiResponse> provisionTenant(@Valid @RequestBody CreateTenantRequest request) {
        return created(provisioningService.provisionTenant(request),
                "Tenant provisioned: " + request.getSubdomain());
    }
}
