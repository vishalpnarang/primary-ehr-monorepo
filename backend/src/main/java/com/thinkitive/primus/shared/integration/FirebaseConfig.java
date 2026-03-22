package com.thinkitive.primus.shared.integration;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Firebase Admin SDK initialisation.
 *
 * <p>Activated only when {@code primus.integrations.firebase.enabled=true}.
 * The service account JSON is loaded from the path specified by
 * {@code primus.integrations.firebase.service-account-path}
 * (environment variable {@code FIREBASE_SERVICE_ACCOUNT_PATH}).
 *
 * <p>Used for:
 * <ul>
 *   <li>Push notifications via Firebase Cloud Messaging (FCM)</li>
 *   <li>Optional: Firebase Authentication token verification</li>
 * </ul>
 *
 * <p>Only one {@link FirebaseApp} instance is created per JVM; subsequent
 * calls are idempotent (guarded by the {@code FirebaseApp.getApps()} check).
 */
@Configuration
@ConditionalOnProperty(name = "primus.integrations.firebase.enabled", havingValue = "true")
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${primus.integrations.firebase.service-account-path:}")
    private String serviceAccountPath;

    @PostConstruct
    public void init() throws IOException {
        if (serviceAccountPath == null || serviceAccountPath.isBlank()) {
            throw new IllegalStateException(
                    "primus.integrations.firebase.enabled=true but "
                    + "primus.integrations.firebase.service-account-path "
                    + "(FIREBASE_SERVICE_ACCOUNT_PATH) is not set.");
        }

        Path path = Path.of(serviceAccountPath);
        if (!Files.exists(path)) {
            throw new IllegalStateException(
                    "Firebase service account file not found at: " + serviceAccountPath);
        }

        // Guard against duplicate initialisation (e.g., during tests or hot reload).
        if (!FirebaseApp.getApps().isEmpty()) {
            log.info("Firebase Admin SDK already initialised — skipping.");
            return;
        }

        try (InputStream serviceAccount = new FileInputStream(path.toFile())) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();
            FirebaseApp.initializeApp(options);
            log.info("Firebase Admin SDK initialised from: {}", serviceAccountPath);
        }
    }
}
