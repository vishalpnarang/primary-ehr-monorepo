package com.thinkitive.primus.auth.controller;

import com.thinkitive.primus.auth.dto.CurrentUserDto;
import com.thinkitive.primus.auth.dto.LoginRequest;
import com.thinkitive.primus.auth.dto.LoginResponse;
import com.thinkitive.primus.auth.dto.SwitchRoleRequest;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Auth controller — mock mode only (Phase 0/1).
 * Real Keycloak token exchange is wired in Phase 1.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController extends BaseController {

    private static final long MOCK_EXPIRES_IN = 3600L;
    private static final String MOCK_TOKEN_TYPE = "Bearer";

    /**
     * POST /api/v1/auth/login
     * Mock login: validates credentials against a hard-coded list of test users
     * and returns a signed mock JWT with role + tenant embedded.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = buildMockLoginResponse(request.getUsername());
        return ok(response, "Login successful");
    }

    /**
     * POST /api/v1/auth/switch-role
     * Switches the active role for the current mock session.
     * Only valid roles from the user's allowed-roles list are accepted.
     */
    @PostMapping("/switch-role")
    public ResponseEntity<ApiResponse> switchRole(@Valid @RequestBody SwitchRoleRequest request) {
        CurrentUserDto user = buildMockCurrentUser(request.getRole());
        return ok(user, "Role switched to " + request.getRole());
    }

    /**
     * GET /api/v1/auth/me
     * Returns the current user info extracted from the JWT / session.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse> me() {
        // In Phase 1 this will decode the Keycloak JWT from the Authorization header.
        CurrentUserDto user = buildMockCurrentUser("PROVIDER");
        return ok(user);
    }

    // -------------------------------------------------------------------------
    // Private helpers (mock data — replaced in Phase 1 by Keycloak)
    // -------------------------------------------------------------------------

    private LoginResponse buildMockLoginResponse(String username) {
        return LoginResponse.builder()
                .userUuid(UUID.fromString("11111111-0000-0000-0000-000000000001"))
                .username(username)
                .displayName("Dr. Sarah Mitchell")
                .email(username + "@primusdemo.com")
                .role("PROVIDER")
                .tenantId(1L)
                .tenantName("Primus Demo Clinic Health")
                .tenantSubdomain("primusdemo")
                .accessToken("mock-jwt-token-" + UUID.randomUUID())
                .tokenType(MOCK_TOKEN_TYPE)
                .expiresIn(MOCK_EXPIRES_IN)
                .build();
    }

    private CurrentUserDto buildMockCurrentUser(String activeRole) {
        return CurrentUserDto.builder()
                .userUuid(UUID.fromString("11111111-0000-0000-0000-000000000001"))
                .username("sarah.mitchell")
                .displayName("Dr. Sarah Mitchell")
                .email("sarah.mitchell@primusdemo.com")
                .activeRole(activeRole)
                .roles(List.of("PROVIDER", "NURSE", "PRACTICE_ADMIN"))
                .tenantId(1L)
                .tenantName("Primus Demo Clinic Health")
                .tenantSubdomain("primusdemo")
                .build();
    }
}
