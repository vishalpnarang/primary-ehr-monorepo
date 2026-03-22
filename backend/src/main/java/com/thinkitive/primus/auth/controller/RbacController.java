package com.thinkitive.primus.auth.controller;

import com.thinkitive.primus.auth.service.RbacService;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/rbac")
@RequiredArgsConstructor
public class RbacController extends BaseController {

    private final RbacService rbacService;

    // -------------------------------------------------------------------------
    // Roles
    // -------------------------------------------------------------------------

    /** GET /api/v1/rbac/roles
     *  Returns all active roles for the current tenant. */
    @GetMapping("/roles")
    public ResponseEntity<ApiResponse> getRoles() {
        Long tenantId = TenantContext.getTenantId();
        return ok(rbacService.getRolesByTenant(tenantId));
    }

    // -------------------------------------------------------------------------
    // Permissions
    // -------------------------------------------------------------------------

    /** GET /api/v1/rbac/roles/{id}/permissions
     *  Returns all permissions currently assigned to the specified role. */
    @GetMapping("/roles/{id}/permissions")
    public ResponseEntity<ApiResponse> getPermissionsForRole(@PathVariable Long id) {
        return ok(rbacService.getPermissionsByRole(id));
    }

    /** POST /api/v1/rbac/roles/{roleId}/permissions/{permissionId}
     *  Assigns a global permission to a tenant role. */
    @PostMapping("/roles/{roleId}/permissions/{permissionId}")
    public ResponseEntity<ApiResponse> assignPermission(
            @PathVariable Long roleId,
            @PathVariable Long permissionId) {
        return created(
                rbacService.assignPermissionToRole(roleId, permissionId),
                "Permission assigned to role"
        );
    }

    // -------------------------------------------------------------------------
    // Features
    // -------------------------------------------------------------------------

    /** GET /api/v1/rbac/features
     *  Returns all feature flags for the current tenant. */
    @GetMapping("/features")
    public ResponseEntity<ApiResponse> getFeatures() {
        Long tenantId = TenantContext.getTenantId();
        return ok(rbacService.getFeaturesByTenant(tenantId));
    }

    /** PUT /api/v1/rbac/features/{id}/toggle
     *  Toggles the enabled state of the specified feature flag. */
    @PutMapping("/features/{id}/toggle")
    public ResponseEntity<ApiResponse> toggleFeature(@PathVariable Long id) {
        return ok(rbacService.toggleFeature(id), "Feature flag updated");
    }
}
