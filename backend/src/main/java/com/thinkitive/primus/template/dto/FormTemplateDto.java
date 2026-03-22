package com.thinkitive.primus.template.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

/**
 * Read-only DTO representing a form template returned to the client.
 */
@Data
@Builder
public class FormTemplateDto {

    private String uuid;
    private String name;
    private String description;
    private String category;
    private String schemaData;
    private Integer version;
    private String status;
    private Long tenantId;
    private String createdBy;
    private Instant createdAt;
    private Instant modifiedAt;
}
