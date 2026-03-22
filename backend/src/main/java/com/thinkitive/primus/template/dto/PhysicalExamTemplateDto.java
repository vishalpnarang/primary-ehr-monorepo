package com.thinkitive.primus.template.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class PhysicalExamTemplateDto {

    private String uuid;
    private String name;
    /** Raw JSON string: [{section, findings[]}] */
    private String sections;
    private boolean isDefault;
    private Instant createdAt;
    private Instant modifiedAt;
}
