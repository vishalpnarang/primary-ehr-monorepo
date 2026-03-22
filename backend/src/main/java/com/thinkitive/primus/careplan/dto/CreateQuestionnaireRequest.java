package com.thinkitive.primus.careplan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateQuestionnaireRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    private String description;

    /** PHQ9 | GAD7 | AUDIT | CUSTOM */
    private String category;

    /** JSON array of question objects */
    @NotBlank
    private String questions;

    /** Optional JSON scoring logic */
    private String scoringLogic;

    private boolean isPublished = false;
}
