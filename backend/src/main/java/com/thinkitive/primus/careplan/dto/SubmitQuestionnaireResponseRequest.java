package com.thinkitive.primus.careplan.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.Instant;

@Data
public class SubmitQuestionnaireResponseRequest {

    @NotBlank
    private String patientUuid;

    /** Optional — links this response to an encounter. */
    private String encounterUuid;

    /** JSON object: {answers: [{questionId, answer, score}]} */
    @NotBlank
    private String responses;

    /** Pre-computed total score, if calculated client-side — otherwise computed server-side. */
    private Integer totalScore;

    private String completedBy;

    private Instant completedAt;
}
