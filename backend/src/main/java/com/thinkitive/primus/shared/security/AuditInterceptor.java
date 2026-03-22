package com.thinkitive.primus.shared.security;

import com.thinkitive.primus.shared.config.TenantContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Instant;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Spring MVC interceptor that records every PHI access into the {@code audit_log}
 * table (changeset 008-create-audit-log).
 *
 * <p>Fields captured per request:
 * <ul>
 *   <li>user_id / user_name — resolved from the Keycloak JWT</li>
 *   <li>tenant_id — from {@link TenantContext}</li>
 *   <li>action — HTTP method mapped to VIEW / CREATE / UPDATE / DELETE</li>
 *   <li>resource_type / resource_id — parsed from the URI path</li>
 *   <li>ip_address — honouring X-Forwarded-For for reverse-proxy deployments</li>
 *   <li>created — insertion timestamp (database default: now())</li>
 * </ul>
 *
 * <p>HIPAA Safeguard: 45 CFR § 164.312(b) — Audit controls.
 */
@Component
public class AuditInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(AuditInterceptor.class);

    /**
     * Captures the first two path segments after {@code /api/v1/}:
     *   /api/v1/{resourceType}/{resourceId}/…
     * Group 1 = resourceType, Group 2 = resourceId (optional).
     */
    private static final Pattern RESOURCE_PATTERN =
            Pattern.compile("^/api/v\\d+/([^/]+)(?:/([^/?]+))?.*$");

    private static final String INSERT_SQL = """
            INSERT INTO audit_log
                (tenant_id, user_name, action, resource_type, resource_id, ip_address, created, modified, archive)
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, false)
            """;

    private static final String PREFERRED_USERNAME = "preferred_username";

    private final JdbcTemplate jdbcTemplate;

    public AuditInterceptor(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // -------------------------------------------------------------------------
    // HandlerInterceptor
    // -------------------------------------------------------------------------

    @Override
    public boolean preHandle(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull Object handler) {
        // Continue the filter chain regardless — audit must never block a request.
        return true;
    }

    @Override
    public void afterCompletion(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull Object handler,
            @Nullable Exception ex) {

        // Only audit mutating operations on the API.
        String path = request.getServletPath();
        if (!path.startsWith("/api/")) {
            return;
        }

        int status = response.getStatus();
        // Skip server errors (5xx) — those are logged elsewhere and do not represent
        // successful PHI access.
        if (status >= 500) {
            return;
        }

        try {
            writeAuditRecord(request);
        } catch (Exception auditEx) {
            // Audit failure must never propagate to the caller.
            log.error("Failed to write audit log entry for [{} {}]: {}",
                    request.getMethod(), path, auditEx.getMessage(), auditEx);
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private void writeAuditRecord(HttpServletRequest request) {
        String userName = resolveUserName();
        Long tenantId = TenantContext.getTenantId();
        String action = methodToAction(request.getMethod());
        String ipAddress = resolveClientIp(request);

        String path = request.getServletPath();
        Matcher matcher = RESOURCE_PATTERN.matcher(path);
        String resourceType = matcher.matches() ? matcher.group(1) : path;
        String resourceId = matcher.matches() ? matcher.group(2) : null;

        Instant now = Instant.now();

        jdbcTemplate.update(
                INSERT_SQL,
                tenantId,
                userName,
                action,
                resourceType,
                resourceId,
                ipAddress,
                now,
                now
        );

        log.debug("Audit: user={} action={} resource={}/{} ip={} tenant={}",
                userName, action, resourceType, resourceId, ipAddress, tenantId);
    }

    private String resolveUserName() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return "anonymous";
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof Jwt jwt) {
            String username = jwt.getClaimAsString(PREFERRED_USERNAME);
            if (username != null && !username.isBlank()) {
                return username;
            }
            String sub = jwt.getClaimAsString("sub");
            if (sub != null && !sub.isBlank()) {
                return sub;
            }
        }
        String name = auth.getName();
        return (name != null && !name.isBlank() && !"anonymousUser".equals(name))
                ? name
                : "anonymous";
    }

    private static String methodToAction(String httpMethod) {
        return switch (httpMethod.toUpperCase()) {
            case "GET"    -> "VIEW";
            case "POST"   -> "CREATE";
            case "PUT", "PATCH" -> "UPDATE";
            case "DELETE" -> "DELETE";
            default       -> httpMethod.toUpperCase();
        };
    }

    /**
     * Returns the originating client IP, honouring the {@code X-Forwarded-For}
     * header set by load-balancers / reverse-proxies (AWS ALB, nginx, etc.).
     */
    private static String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            // X-Forwarded-For may contain a comma-separated chain; the first entry
            // is the original client.
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
