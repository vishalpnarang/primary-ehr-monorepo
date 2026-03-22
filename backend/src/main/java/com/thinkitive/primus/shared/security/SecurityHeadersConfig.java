package com.thinkitive.primus.shared.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Adds HIPAA-required and OWASP-recommended HTTP security headers to every
 * response served by the application.
 *
 * <p>Headers applied:
 * <ul>
 *   <li><b>Strict-Transport-Security</b> — enforce HTTPS for 1 year, include subdomains</li>
 *   <li><b>X-Content-Type-Options</b> — prevent MIME-sniffing attacks</li>
 *   <li><b>X-Frame-Options</b> — prevent clickjacking</li>
 *   <li><b>X-XSS-Protection</b> — legacy browser XSS filter (belt-and-suspenders)</li>
 *   <li><b>Content-Security-Policy</b> — restrict resource loading to same origin</li>
 *   <li><b>Referrer-Policy</b> — suppress referrer on cross-origin navigation</li>
 *   <li><b>Permissions-Policy</b> — disable unneeded browser features</li>
 *   <li><b>Cache-Control / Pragma / Expires</b> — prevent PHI caching by browsers
 *       and intermediary proxies (HIPAA Technical Safeguard)</li>
 * </ul>
 *
 * <p>HIPAA Safeguard: 45 CFR § 164.312(a)(2)(iv) — Encryption and Decryption;
 * 45 CFR § 164.312(e)(2)(ii) — Encryption in transit.
 */
@Configuration
public class SecurityHeadersConfig extends OncePerRequestFilter {

    // HSTS: 1 year (31 536 000 seconds), include sub-domains, allow preloading.
    private static final String HSTS_VALUE =
            "max-age=31536000; includeSubDomains; preload";

    // CSP: only allow resources from the same origin.
    // Adjust as needed when CDN / external font / analytics resources are added.
    private static final String CSP_VALUE =
            "default-src 'self'; "
            + "script-src 'self'; "
            + "style-src 'self' 'unsafe-inline'; "
            + "img-src 'self' data:; "
            + "font-src 'self'; "
            + "connect-src 'self'; "
            + "frame-ancestors 'none'; "
            + "form-action 'self'; "
            + "base-uri 'self'";

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Transport security
        response.setHeader("Strict-Transport-Security", HSTS_VALUE);

        // MIME / framing / XSS
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("X-XSS-Protection", "1; mode=block");

        // Content security
        response.setHeader("Content-Security-Policy", CSP_VALUE);
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        response.setHeader("Permissions-Policy",
                "camera=(), microphone=(), geolocation=(), payment=()");

        // PHI cache prevention — applied to all responses so that browsers and
        // CDN / proxy caches never store protected health information.
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");

        filterChain.doFilter(request, response);
    }
}
