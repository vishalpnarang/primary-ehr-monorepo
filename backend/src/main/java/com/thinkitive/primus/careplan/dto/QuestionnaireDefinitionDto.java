package com.thinkitive.primus.careplan.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class QuestionnaireDefinitionDto {

    private String uuid;
    private String name;
    private String description;
    private String category;
    /** Raw JSON string: [{id, text, type, options[]}] */
    private String questions;
    /** Raw JSON string: {ranges: [{min, max, riskLevel}]} */
    private String scoringLogic;
    private boolean isPublished;
    private Instant createdAt;
    private Instant modifiedAt;
}
