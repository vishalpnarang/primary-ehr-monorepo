package com.thinkitive.primus.shared.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

/**
 * MVC CORS configuration.
 *
 * <p>Allowed origins are driven by the property
 * {@code primus.security.cors.allowed-origins} (comma-separated list).
 * This replaces the previous hard-coded localhost list and enables
 * environment-specific origin restriction without code changes.
 *
 * <p>Default value (local dev):
 * {@code http://localhost:5173,http://localhost:5174,http://localhost:5175,
 * http://localhost:5176,http://localhost:5177}
 *
 * <p>In production, set {@code CORS_ALLOWED_ORIGINS} to the actual domain(s),
 * e.g. {@code https://app.primus-ehr.com,https://patient.primus-ehr.com}.
 *
 * <p>HIPAA / OWASP: restricting CORS origins prevents cross-site request
 * forgery and unauthorized cross-origin PHI exfiltration.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final List<String> allowedOrigins;

    public CorsConfig(
            @Value("${primus.security.cors.allowed-origins:"
                    + "http://localhost:5173,"
                    + "http://localhost:5174,"
                    + "http://localhost:5175,"
                    + "http://localhost:5176,"
                    + "http://localhost:5177}")
            String allowedOriginsConfig) {
        this.allowedOrigins = Arrays.stream(allowedOriginsConfig.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
    }

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins.toArray(String[]::new))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
