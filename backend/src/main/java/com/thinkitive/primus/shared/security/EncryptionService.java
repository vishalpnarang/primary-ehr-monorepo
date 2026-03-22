package com.thinkitive.primus.shared.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * AES-256-GCM encryption service for PHI fields stored at rest.
 *
 * <p>Algorithm choice:
 * <ul>
 *   <li>AES-256 — NIST-approved, HIPAA-compatible symmetric cipher</li>
 *   <li>GCM mode — authenticated encryption (provides both confidentiality and
 *       integrity); preferred over CBC for new code</li>
 *   <li>12-byte random IV per operation — never reused with the same key</li>
 *   <li>128-bit authentication tag</li>
 * </ul>
 *
 * <p>Key provisioning: the 256-bit (32-byte) key is read from the environment
 * variable {@code ENCRYPTION_KEY} via Spring property
 * {@code primus.security.encryption.key}.  The value must be a Base64-encoded
 * 32-byte secret.  In production, inject this from AWS Secrets Manager or
 * Parameter Store — never commit it to source control.
 *
 * <p>Ciphertext format stored in the database (all Base64-encoded together):
 * <pre>
 *   [ 12-byte IV ][ 16-byte GCM auth tag ][ n-byte ciphertext ]
 * </pre>
 * The IV is prepended to the ciphertext so each encrypted value is
 * self-contained and can be decrypted independently.
 *
 * <p>HIPAA Safeguard: 45 CFR § 164.312(a)(2)(iv) — Encryption and Decryption;
 * 45 CFR § 164.312(e)(2)(ii) — Encryption in transit (complementary).
 */
@Service
public class EncryptionService {

    private static final Logger log = LoggerFactory.getLogger(EncryptionService.class);

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int IV_LENGTH_BYTES = 12;
    private static final int GCM_TAG_LENGTH_BITS = 128;
    private static final int KEY_LENGTH_BYTES = 32; // 256-bit

    private final SecretKey secretKey;
    private final boolean enabled;
    private final SecureRandom secureRandom = new SecureRandom();

    public EncryptionService(
            @Value("${primus.security.encryption.key:}") String base64Key) {

        if (base64Key == null || base64Key.isBlank()) {
            log.warn("primus.security.encryption.key is not configured. "
                    + "Field-level encryption is DISABLED. "
                    + "This is NOT acceptable in production environments.");
            this.secretKey = null;
            this.enabled = false;
            return;
        }

        byte[] keyBytes;
        try {
            keyBytes = Base64.getDecoder().decode(base64Key.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException(
                    "primus.security.encryption.key is not valid Base64.", e);
        }

        if (keyBytes.length != KEY_LENGTH_BYTES) {
            throw new IllegalStateException(
                    "Encryption key must be exactly 32 bytes (256 bits) when Base64-decoded. "
                    + "Got " + keyBytes.length + " bytes.");
        }

        this.secretKey = new SecretKeySpec(keyBytes, "AES");
        this.enabled = true;
        log.info("Field-level AES-256-GCM encryption is ENABLED.");
    }

    /**
     * Returns {@code true} when a key has been configured and encryption is active.
     * Callers can use this flag to skip encryption in local dev without crashing.
     */
    public boolean isEnabled() {
        return enabled;
    }

    /**
     * Encrypts {@code plaintext} with AES-256-GCM.
     *
     * @param plaintext the value to encrypt (e.g., an SSN)
     * @return Base64-encoded ciphertext containing the IV + auth tag + ciphertext
     * @throws IllegalStateException if the encryption key has not been configured
     */
    public String encrypt(String plaintext) {
        if (!enabled) {
            throw new IllegalStateException(
                    "Encryption is disabled — primus.security.encryption.key is not set.");
        }
        if (plaintext == null) {
            return null;
        }

        try {
            byte[] iv = generateIv();
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec paramSpec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, paramSpec);

            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(java.nio.charset.StandardCharsets.UTF_8));

            // Prepend IV to ciphertext so it can be recovered during decryption.
            ByteBuffer buffer = ByteBuffer.allocate(iv.length + ciphertext.length);
            buffer.put(iv);
            buffer.put(ciphertext);

            return Base64.getEncoder().encodeToString(buffer.array());

        } catch (Exception e) {
            throw new RuntimeException("Failed to encrypt value.", e);
        }
    }

    /**
     * Decrypts a value previously produced by {@link #encrypt(String)}.
     *
     * @param ciphertext Base64-encoded string produced by {@link #encrypt(String)}
     * @return the original plaintext
     * @throws IllegalStateException if the encryption key has not been configured
     */
    public String decrypt(String ciphertext) {
        if (!enabled) {
            throw new IllegalStateException(
                    "Encryption is disabled — primus.security.encryption.key is not set.");
        }
        if (ciphertext == null) {
            return null;
        }

        try {
            byte[] decoded = Base64.getDecoder().decode(ciphertext);

            // Extract the IV from the front of the decoded bytes.
            ByteBuffer buffer = ByteBuffer.wrap(decoded);
            byte[] iv = new byte[IV_LENGTH_BYTES];
            buffer.get(iv);
            byte[] encryptedBytes = new byte[buffer.remaining()];
            buffer.get(encryptedBytes);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec paramSpec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, paramSpec);

            byte[] plainBytes = cipher.doFinal(encryptedBytes);
            return new String(plainBytes, java.nio.charset.StandardCharsets.UTF_8);

        } catch (Exception e) {
            throw new RuntimeException("Failed to decrypt value.", e);
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private byte[] generateIv() {
        byte[] iv = new byte[IV_LENGTH_BYTES];
        secureRandom.nextBytes(iv);
        return iv;
    }
}
