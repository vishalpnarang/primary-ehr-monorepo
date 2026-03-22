package com.thinkitive.primus.shared.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Servlet filter that sanitizes PHI (Protected Health Information) from logs.
 *
 * <p>Wraps the request and response to allow body inspection, then masks any
 * PHI fields found in JSON payloads before they appear in log output. The
 * actual request and response data are NOT modified — only the log copy.
 *
 * <p>HIPAA Safeguard: 45 CFR § 164.312(b) — Audit controls.
 */
@Component
@Order(1)
public class PhiLogFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(PhiLogFilter.class);

    /**
     * JSON field names whose values must be masked in log output.
     * Matches exact field names (case-insensitive) in serialized JSON.
     */
    private static final Set<String> PHI_FIELDS = Set.of(
            "ssn",
            "socialSecurityNumber",
            "dob",
            "dateOfBirth",
            "phone",
            "phoneNumber",
            "email",
            "emailAddress",
            "address",
            "addressLine1",
            "addressLine2",
            "city",
            "zipCode",
            "postalCode",
            "firstName",
            "lastName",
            "middleName",
            "preferredName",
            "mrn",
            "medicalRecordNumber",
            "insuranceMemberId",
            "groupNumber"
    );

    /**
     * Regex pattern that matches any of the PHI field names followed by a JSON
     * string value.  The captured group (1) is the field name; group (2) is the
     * value that will be replaced with "***".
     *
     * Example match: "ssn":"123-45-6789"
     */
    private static final Pattern PHI_PATTERN = buildPhiPattern();

    private static Pattern buildPhiPattern() {
        String fieldAlternation = String.join("|", PHI_FIELDS);
        // Matches: "fieldName" : "anyValue"  (with optional whitespace around colon)
        // Also matches numeric/boolean values but those are less likely for PHI strings.
        return Pattern.compile(
                "\"(?i)(" + fieldAlternation + ")\"\\s*:\\s*\"([^\"\\\\]*(\\\\.[^\"\\\\]*)*)\"",
                Pattern.CASE_INSENSITIVE
        );
    }

    private static final String MASK = "\"$1\":\"***\"";
    private static final int MAX_LOG_BODY_BYTES = 4096;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);

        try {
            filterChain.doFilter(wrappedRequest, wrappedResponse);
        } finally {
            logSanitizedRequest(wrappedRequest);
            logSanitizedResponse(wrappedResponse);
            // Copy body back so the client actually receives the response.
            wrappedResponse.copyBodyToResponse();
        }
    }

    private void logSanitizedRequest(ContentCachingRequestWrapper request) {
        if (!log.isDebugEnabled()) {
            return;
        }

        byte[] bodyBytes = request.getContentAsByteArray();
        if (bodyBytes.length == 0) {
            log.debug("PHI-SAFE REQUEST  [{} {}] — no body",
                    request.getMethod(), request.getRequestURI());
            return;
        }

        String rawBody = new String(
                bodyBytes, 0, Math.min(bodyBytes.length, MAX_LOG_BODY_BYTES),
                StandardCharsets.UTF_8);

        String sanitized = sanitize(rawBody);

        log.debug("PHI-SAFE REQUEST  [{} {}] body={}",
                request.getMethod(), request.getRequestURI(), sanitized);
    }

    private void logSanitizedResponse(ContentCachingResponseWrapper response) {
        if (!log.isDebugEnabled()) {
            return;
        }

        byte[] bodyBytes = response.getContentAsByteArray();
        if (bodyBytes.length == 0) {
            return;
        }

        String contentType = response.getContentType();
        if (contentType == null || !contentType.contains("application/json")) {
            return;
        }

        String rawBody = new String(
                bodyBytes, 0, Math.min(bodyBytes.length, MAX_LOG_BODY_BYTES),
                StandardCharsets.UTF_8);

        String sanitized = sanitize(rawBody);

        log.debug("PHI-SAFE RESPONSE [{}] body={}",
                response.getStatus(), sanitized);
    }

    /**
     * Replaces PHI field values in a JSON string with "***".
     *
     * @param json raw JSON string (may contain PHI)
     * @return sanitized JSON safe to write to logs
     */
    static String sanitize(String json) {
        if (json == null || json.isBlank()) {
            return json;
        }
        return PHI_PATTERN.matcher(json).replaceAll(MASK);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        // Skip static resources and actuator endpoints — no PHI expected there.
        return path.startsWith("/actuator/")
                || path.startsWith("/swagger-ui/")
                || path.startsWith("/v3/api-docs");
    }
}
