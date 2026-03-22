package com.thinkitive.primus.crm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.Instant;

@Data
public class CreateCampaignRequest {

    @NotBlank(message = "Campaign name is required")
    private String name;

    private String type;
    private String targetAudience;
    private Instant scheduledAt;
}
