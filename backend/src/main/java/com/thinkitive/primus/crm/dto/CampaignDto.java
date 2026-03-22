package com.thinkitive.primus.crm.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class CampaignDto {

    private String uuid;
    private String name;
    private String type;
    private String status;
    private String targetAudience;
    private Instant scheduledAt;
    private Instant completedAt;
    private String metrics;
    private Instant createdAt;
    private Instant modifiedAt;
}
