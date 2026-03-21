package com.thinkitive.primus;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Base64;

/**
 * Base class for integration tests. All IT subclasses extend this.
 *
 * Phase-0: uses H2 in-memory database (application-test.yml) and a
 * mock JWT token for authentication. Phase 1 will switch to a real
 * Keycloak test realm or Testcontainers-backed Keycloak.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc
public abstract class IntegrationTestBase {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    /**
     * Generates a minimal mock JWT bearer token for integration test requests.
     *
     * The token header and payload are Base64-encoded JSON; the signature is
     * a placeholder. In Phase 1 this will be replaced with a real token
     * issued by a Testcontainers Keycloak instance.
     *
     * @param tenantId  the tenant ID to embed in the token
     * @param role      the role claim (e.g. "ROLE_PROVIDER")
     * @return "Bearer <token>" string suitable for use in Authorization header
     */
    protected String mockJwtToken(Long tenantId, String role) {
        String header  = base64Url("{\"alg\":\"none\",\"typ\":\"JWT\"}");
        String payload = base64Url(String.format(
                "{\"sub\":\"test-user\",\"tenant_id\":\"%d\",\"role\":\"%s\"," +
                "\"preferred_username\":\"test@primus.health\",\"exp\":9999999999}",
                tenantId, role));
        return "Bearer " + header + "." + payload + ".mock-sig";
    }

    /**
     * Convenience overload — uses tenant 1 and ROLE_PROVIDER.
     */
    protected String mockJwtToken() {
        return mockJwtToken(1L, "ROLE_PROVIDER");
    }

    /**
     * Convenience overload — uses tenant 1 with a specific role.
     */
    protected String mockJwtToken(String role) {
        return mockJwtToken(1L, role);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private static String base64Url(String json) {
        return Base64.getUrlEncoder()
                     .withoutPadding()
                     .encodeToString(json.getBytes());
    }
}
