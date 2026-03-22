package com.thinkitive.primus.template.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class SoapNoteTemplateDto {

    private String uuid;
    private String name;
    private String category;
    private String subjectiveTemplate;
    private String objectiveTemplate;
    private String assessmentTemplate;
    private String planTemplate;
    private boolean isDefault;
    private Instant createdAt;
    private Instant modifiedAt;
}
