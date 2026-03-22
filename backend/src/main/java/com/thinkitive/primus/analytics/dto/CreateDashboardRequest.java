package com.thinkitive.primus.analytics.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateDashboardRequest {

    @NotBlank(message = "Dashboard name is required")
    private String name;

    private String description;

    private String category;

    @NotNull(message = "Query config is required")
    private String queryConfig;

    private String chartType;

    private Integer displayOrder;

    private String rolesAllowed;
}
