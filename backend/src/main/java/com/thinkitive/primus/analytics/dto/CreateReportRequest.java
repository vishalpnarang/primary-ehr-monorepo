package com.thinkitive.primus.analytics.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateReportRequest {

    @NotBlank(message = "Report name is required")
    private String name;

    private String description;

    private String category;

    @NotBlank(message = "Query SQL is required")
    private String querySql;

    private String parameters;

    private boolean shared = false;
}
