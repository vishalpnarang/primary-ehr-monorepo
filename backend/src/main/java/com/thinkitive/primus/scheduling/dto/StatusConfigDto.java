package com.thinkitive.primus.scheduling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusConfigDto {

    private Long id;
    private String name;
    private String fromStatus;
    private String toStatus;

    /** Comma-separated list of roles, e.g. "ROLE_NURSE,ROLE_PROVIDER" */
    private String allowedRoles;

    /** Hex color, e.g. "#22C55E" */
    private String color;

    private Integer displayOrder;
    private Instant createdAt;
    private Instant modifiedAt;
}
