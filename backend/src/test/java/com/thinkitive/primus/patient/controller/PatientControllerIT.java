package com.thinkitive.primus.patient.controller;

import com.thinkitive.primus.IntegrationTestBase;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.ResultActions;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for {@link PatientController}.
 *
 * Phase-0: service layer returns in-memory mock data; no real DB required.
 * Authentication is satisfied via @WithMockUser (bypasses JWT validation).
 */
class PatientControllerIT extends IntegrationTestBase {

    private static final String BASE_URL = "/api/v1/patients";

    @Test
    @WithMockUser(roles = "PROVIDER")
    void listPatients_shouldReturn200() throws Exception {
        mockMvc.perform(get(BASE_URL)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value("SUCCESS"))
                .andExpect(jsonPath("$.data").exists());
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    void getPatient_existingUuid_shouldReturn200() throws Exception {
        UUID uuid = UUID.fromString("aaaaaaaa-0000-0000-0000-000000000001");

        mockMvc.perform(get(BASE_URL + "/{uuid}", uuid)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("SUCCESS"))
                .andExpect(jsonPath("$.data.mrn").value("PAT-10001"))
                .andExpect(jsonPath("$.data.firstName").value("James"));
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    void getPatient_notFound_shouldReturn200WithMockData() throws Exception {
        // Phase-0 stub always returns mock data regardless of UUID.
        // In Phase 2, this will return 404 for unknown UUIDs.
        UUID unknownUuid = UUID.randomUUID();

        mockMvc.perform(get(BASE_URL + "/{uuid}", unknownUuid)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    void searchPatients_withQuery_shouldReturn200() throws Exception {
        mockMvc.perform(get(BASE_URL + "/search")
                        .param("q", "James")
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    void searchPatients_missingQuery_shouldReturn400() throws Exception {
        mockMvc.perform(get(BASE_URL + "/search")
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    void createPatient_validRequest_shouldReturn201() throws Exception {
        String requestBody = """
                {
                    "firstName": "Maria",
                    "lastName": "Garcia",
                    "dateOfBirth": "1985-07-22",
                    "sex": "FEMALE",
                    "phone": "6145550123"
                }
                """;

        ResultActions result = mockMvc.perform(post(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print());

        result.andExpect(status().isCreated())
              .andExpect(jsonPath("$.data.mrn").isNotEmpty())
              .andExpect(jsonPath("$.data.firstName").value("Maria"))
              .andExpect(jsonPath("$.data.lastName").value("Garcia"));
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    void createPatient_missingFirstName_shouldReturn400() throws Exception {
        String requestBody = """
                {
                    "lastName": "Garcia",
                    "dateOfBirth": "1985-07-22",
                    "sex": "FEMALE"
                }
                """;

        mockMvc.perform(post(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    void listPatients_unauthenticated_shouldReturn401() throws Exception {
        mockMvc.perform(get(BASE_URL)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    void getTimeline_shouldReturn200() throws Exception {
        UUID uuid = UUID.fromString("aaaaaaaa-0000-0000-0000-000000000001");

        mockMvc.perform(get(BASE_URL + "/{uuid}/timeline", uuid)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }
}
