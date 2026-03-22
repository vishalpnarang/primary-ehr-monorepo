package com.thinkitive.primus.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RoleDto {

    private Long id;
    private String uuid;
    private Long tenantId;
    private String name;
    private String description;
    private boolean system;
    private String status;
    private Instant createdAt;
    private Instant modifiedAt;
}
