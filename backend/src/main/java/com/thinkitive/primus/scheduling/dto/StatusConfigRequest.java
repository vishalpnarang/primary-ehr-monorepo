package com.thinkitive.primus.scheduling.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusConfigRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "From status is required")
    private String fromStatus;

    @NotBlank(message = "To status is required")
    private String toStatus;

    /** Comma-separated list of roles, e.g. "ROLE_NURSE,ROLE_PROVIDER" */
    private String allowedRoles;

    /** Hex color, e.g. "#22C55E" */
    private String color;

    private Integer displayOrder;
}
