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
public class FeatureDto {

    private Long id;
    private String uuid;
    private Long tenantId;
    private String name;
    private boolean enabled;
    private String module;
    private Instant modifiedAt;
}
