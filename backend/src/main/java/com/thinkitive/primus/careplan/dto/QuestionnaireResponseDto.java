package com.thinkitive.primus.careplan.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class QuestionnaireResponseDto {

    private String uuid;
    private String questionnaireUuid;
    private String questionnaireName;
    private String patientUuid;
    private String encounterUuid;
    /** Raw JSON: {answers: [{questionId, answer, score}]} */
    private String responses;
    private Integer totalScore;
    private String riskLevel;
    private String completedBy;
    private Instant completedAt;
    private Instant createdAt;
    private Instant modifiedAt;
}
