package com.thinkitive.primus.order.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class LabOrderSetDto {

    private String uuid;
    private String name;
    private String description;
    private String tests;
    private String defaultIcdCodes;
    private boolean isActive;
    private Instant createdAt;
    private Instant modifiedAt;
}
