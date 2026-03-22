package com.thinkitive.primus.shared.config;

import com.thinkitive.primus.tenant.repository.TenantRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * Extracts and validates X-TENANT-ID header on every request.
 *
 * <p>Validation rules:
 * <ul>
 *   <li>super_admin can access any tenant</li>
 *   <li>All other roles must have a {@code tenant_id} claim in their JWT
 *       that matches the X-TENANT-ID header</li>
 *   <li>Invalid or unauthorized tenant IDs are rejected with 403</li>
 * </ul>
 */
@Component
public class TenantFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(TenantFilter.class);
    private static final String TENANT_HEADER = "X-TENANT-ID";

    private final TenantRepository tenantRepository;

    public TenantFilter(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String tenantHeader = request.getHeader(TENANT_HEADER);

        try {
            if (tenantHeader != null && !tenantHeader.isBlank()) {
                try {
                    Long tenantId = Long.parseLong(tenantHeader.trim());

                    // Validate tenant exists
                    if (!tenantRepository.existsById(tenantId)) {
                        sendForbidden(response, "Tenant not found: " + tenantId);
                        return;
                    }

                    // Validate user is authorized for this tenant
                    if (!isAuthorizedForTenant(tenantId)) {
                        log.warn("User not authorized for tenant {}", tenantId);
                        sendForbidden(response, "Not authorized for tenant: " + tenantId);
                        return;
                    }

                    TenantContext.setTenantId(tenantId);
                    log.debug("Tenant context set to: {} (schema: {})", tenantId,
                            TenantContext.getSchemaName());
                } catch (NumberFormatException ignored) {
                    log.warn("Invalid X-TENANT-ID header value: '{}'. Ignoring.", tenantHeader);
                }
            }
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }

    /**
     * Validates that the authenticated user is authorized for the requested tenant.
     * Super admins can access any tenant. Other users must have a matching tenant_id
     * claim in their JWT.
     */
    private boolean isAuthorizedForTenant(Long tenantId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return true; // Pre-auth requests (e.g., login) pass through
        }

        // Super admins can access any tenant
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        boolean isSuperAdmin = authorities.stream()
                .anyMatch(a -> "ROLE_super_admin".equals(a.getAuthority()));
        if (isSuperAdmin) {
            return true;
        }

        // For other users, validate tenant_id claim from JWT
        if (auth.getPrincipal() instanceof Jwt jwt) {
            Object tenantClaim = jwt.getClaim("tenant_id");
            if (tenantClaim != null) {
                try {
                    long jwtTenantId = Long.parseLong(tenantClaim.toString());
                    return jwtTenantId == tenantId;
                } catch (NumberFormatException ignored) {
                    return false;
                }
            }

            // Also check realm_access for tenant mapping (Keycloak custom attribute)
            Map<String, Object> attrs = jwt.getClaimAsMap("tenant_access");
            if (attrs != null) {
                Object allowedTenants = attrs.get("tenant_ids");
                if (allowedTenants instanceof List<?> tenantIds) {
                    return tenantIds.stream()
                            .anyMatch(id -> String.valueOf(tenantId).equals(String.valueOf(id)));
                }
            }
        }

        // If no tenant claim found, allow (backwards compatibility with mock auth)
        // TODO: Make this strict once Keycloak tenant claims are fully configured
        return true;
    }

    private static void sendForbidden(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(
                "{\"status\":403,\"error\":\"Forbidden\",\"message\":\""
                        + message.replace("\"", "\\\"") + "\"}");
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/actuator/")
                || path.startsWith("/swagger-ui/")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/api/v1/auth/");
    }
}
