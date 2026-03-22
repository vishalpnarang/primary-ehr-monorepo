package com.thinkitive.primus.analytics.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class SavedReportDto {

    private String uuid;
    private String name;
    private String description;
    private String category;
    private String querySql;
    private String parameters;
    private String createdByUser;
    private boolean shared;
    private Instant lastRunAt;
    private Instant createdAt;
    private Instant modifiedAt;
}
