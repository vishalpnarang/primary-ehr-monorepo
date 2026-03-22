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
public class PermissionDto {

    private Long id;
    private String uuid;
    private String name;
    private String description;
    private String module;
    private String action;
    private Instant createdAt;
}
