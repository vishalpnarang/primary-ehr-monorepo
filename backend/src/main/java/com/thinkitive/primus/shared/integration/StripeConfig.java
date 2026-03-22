package com.thinkitive.primus.shared.integration;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;

/**
 * Stripe SDK initialisation.
 *
 * <p>Activated only when {@code primus.integrations.stripe.enabled=true} is set.
 * The Stripe API key is read from the {@code STRIPE_API_KEY} environment variable
 * (mapped to {@code primus.integrations.stripe.api-key} in application.yml).
 *
 * <p>Never hard-code the API key in source.  In production, inject it via
 * AWS Secrets Manager or Parameter Store.
 */
@Configuration
@ConditionalOnProperty(name = "primus.integrations.stripe.enabled", havingValue = "true")
public class StripeConfig {

    private static final Logger log = LoggerFactory.getLogger(StripeConfig.class);

    @Value("${primus.integrations.stripe.api-key:}")
    private String apiKey;

    @Value("${primus.integrations.stripe.webhook-secret:}")
    private String webhookSecret;

    /**
     * Initialises the global Stripe API key used by all Stripe SDK calls
     * throughout the application.
     *
     * @throws IllegalStateException if the key is blank when Stripe is enabled
     */
    @PostConstruct
    public void init() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "primus.integrations.stripe.enabled=true but "
                    + "primus.integrations.stripe.api-key (STRIPE_API_KEY) is not set.");
        }
        Stripe.apiKey = apiKey;
        log.info("Stripe SDK initialised (key prefix: {}).",
                apiKey.substring(0, Math.min(apiKey.length(), 8)) + "…");

        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.warn("primus.integrations.stripe.webhook-secret is not set. "
                    + "Webhook signature verification will be unavailable.");
        }
    }

    /**
     * Returns the configured webhook signing secret.
     * Used by controllers that handle Stripe webhook callbacks to verify
     * the {@code Stripe-Signature} header.
     *
     * @return the webhook secret, or an empty string if not configured
     */
    public String getWebhookSecret() {
        return webhookSecret != null ? webhookSecret : "";
    }
}
