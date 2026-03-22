package com.thinkitive.primus.template.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class RosTemplateDto {

    private String uuid;
    private String name;
    /** Raw JSON string: [{system, findings[]}] */
    private String systems;
    private boolean isDefault;
    private Instant createdAt;
    private Instant modifiedAt;
}
