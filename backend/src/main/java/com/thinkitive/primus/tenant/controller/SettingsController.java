package com.thinkitive.primus.tenant.controller;

import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import com.thinkitive.primus.tenant.dto.CreateLocationRequest;
import com.thinkitive.primus.tenant.dto.InviteUserRequest;
import com.thinkitive.primus.tenant.dto.UpdateTenantRequest;
import com.thinkitive.primus.tenant.service.SettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class SettingsController extends BaseController {

    private final SettingsService settingsService;

    /** GET /api/v1/settings/organization */
    @GetMapping("/organization")
    public ResponseEntity<ApiResponse> getOrganization() {
        return ok(settingsService.getOrganization());
    }

    /** PUT /api/v1/settings/organization */
    @PutMapping("/organization")
    public ResponseEntity<ApiResponse> updateOrganization(@Valid @RequestBody UpdateTenantRequest request) {
        return ok(settingsService.updateOrganization(request), "Organization updated");
    }

    /** GET /api/v1/settings/locations */
    @GetMapping("/locations")
    public ResponseEntity<ApiResponse> listLocations() {
        return ok(settingsService.listLocations());
    }

    /** POST /api/v1/settings/locations */
    @PostMapping("/locations")
    public ResponseEntity<ApiResponse> addLocation(@Valid @RequestBody CreateLocationRequest request) {
        return created(settingsService.addLocation(request), "Location added");
    }

    /** GET /api/v1/settings/users */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse> listUsers() {
        return ok(settingsService.listUsers());
    }

    /** POST /api/v1/settings/users/invite */
    @PostMapping("/users/invite")
    public ResponseEntity<ApiResponse> inviteUser(@Valid @RequestBody InviteUserRequest request) {
        return ok(settingsService.inviteUser(request), "Invitation sent to " + request.getEmail());
    }
}
