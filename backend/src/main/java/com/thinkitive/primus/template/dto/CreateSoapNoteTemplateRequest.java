package com.thinkitive.primus.template.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateSoapNoteTemplateRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    /** H_AND_P | PROGRESS | FOLLOW_UP | PROCEDURE | TELEHEALTH */
    private String category;

    private String subjectiveTemplate;
    private String objectiveTemplate;
    private String assessmentTemplate;
    private String planTemplate;

    private boolean isDefault = false;
}
