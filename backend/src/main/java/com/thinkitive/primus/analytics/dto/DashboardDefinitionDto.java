package com.thinkitive.primus.analytics.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class DashboardDefinitionDto {

    private String uuid;
    private String name;
    private String description;
    private String category;
    private String queryConfig;
    private String chartType;
    private Integer displayOrder;
    private boolean active;
    private String rolesAllowed;
    private Instant createdAt;
    private Instant modifiedAt;
}
