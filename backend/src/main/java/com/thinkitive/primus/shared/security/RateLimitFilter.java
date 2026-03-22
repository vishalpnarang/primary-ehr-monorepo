package com.thinkitive.primus.shared.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * In-memory sliding-window rate limiter.
 *
 * <p>Two independent buckets per client key:
 * <ol>
 *   <li><b>Auth endpoints</b> ({@code /api/v1/auth/**}) — tighter limit to
 *       prevent brute-force credential attacks (default: 5 req/min)</li>
 *   <li><b>All other API endpoints</b> — general limit to prevent scraping and
 *       denial-of-service (default: 100 req/min)</li>
 * </ol>
 *
 * <p>Client key: authenticated username when a JWT is present; otherwise the
 * originating IP address (honours {@code X-Forwarded-For}).
 *
 * <p>Implementation note: uses a simple per-minute counter with minute-boundary
 * resets.  This is intentionally lightweight and runs in a single JVM process.
 * Replace with Redis + Bucket4j for multi-node deployments.
 *
 * <p>HIPAA Safeguard: 45 CFR § 164.312(a)(2)(iii) — Automatic logoff;
 * OWASP: API Security — Rate Limiting.
 */
@Component
@Order(2)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    private final int requestsPerMinute;
    private final int authRequestsPerMinute;

    /** Map of clientKey → current-minute bucket. */
    private final Map<String, RateBucket> buckets = new ConcurrentHashMap<>();

    public RateLimitFilter(
            @Value("${primus.security.rate-limit.requests-per-minute:100}") int requestsPerMinute,
            @Value("${primus.security.rate-limit.auth-requests-per-minute:5}") int authRequestsPerMinute) {
        this.requestsPerMinute = requestsPerMinute;
        this.authRequestsPerMinute = authRequestsPerMinute;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String path = request.getServletPath();
        String clientKey = resolveClientKey(request);
        boolean isAuthEndpoint = path.startsWith("/api/v1/auth/");
        int limit = isAuthEndpoint ? authRequestsPerMinute : requestsPerMinute;

        String bucketKey = (isAuthEndpoint ? "auth:" : "api:") + clientKey;
        RateBucket bucket = buckets.computeIfAbsent(bucketKey, k -> new RateBucket());

        if (!bucket.tryConsume(limit)) {
            log.warn("Rate limit exceeded for client={} path={} limit={}/min",
                    clientKey, path, limit);
            sendTooManyRequests(response, limit);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private static void sendTooManyRequests(HttpServletResponse response, int limit)
            throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(
                "{\"status\":429,\"error\":\"Too Many Requests\","
                + "\"message\":\"Rate limit of " + limit + " requests/minute exceeded. "
                + "Please slow down and retry.\"}");
    }

    // -------------------------------------------------------------------------
    // Client key resolution
    // -------------------------------------------------------------------------

    private static String resolveClientKey(HttpServletRequest request) {
        // Prefer authenticated username so limits are per-user, not per-IP.
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()
                && auth.getPrincipal() instanceof Jwt jwt) {
            String username = jwt.getClaimAsString("preferred_username");
            if (username != null && !username.isBlank()) {
                return "user:" + username;
            }
            String sub = jwt.getClaimAsString("sub");
            if (sub != null && !sub.isBlank()) {
                return "user:" + sub;
            }
        }
        return "ip:" + resolveClientIp(request);
    }

    private static String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    // -------------------------------------------------------------------------
    // Rate bucket — one per (clientKey × endpoint-class)
    // -------------------------------------------------------------------------

    /**
     * Simple fixed-window counter that resets at the top of each minute.
     * Thread-safe via {@link AtomicInteger} and volatile epoch tracking.
     */
    private static class RateBucket {

        private final AtomicInteger counter = new AtomicInteger(0);
        private volatile long windowStartEpochMinute = currentMinute();

        /**
         * Attempts to consume one token from this bucket.
         *
         * @param limit maximum requests allowed in the current minute window
         * @return {@code true} if the request is within the limit; {@code false} if
         *         the limit has been exceeded
         */
        boolean tryConsume(int limit) {
            long currentMinute = currentMinute();
            if (currentMinute != windowStartEpochMinute) {
                // New minute — reset the window.
                windowStartEpochMinute = currentMinute;
                counter.set(0);
            }
            int current = counter.incrementAndGet();
            return current <= limit;
        }

        private static long currentMinute() {
            return Instant.now().getEpochSecond() / 60;
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/actuator/")
                || path.startsWith("/swagger-ui/")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/ws/");
    }
}
