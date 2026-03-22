package com.thinkitive.primus.billing.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class MembershipPlanDto {

    private String uuid;
    private String name;
    private String description;
    private BigDecimal priceMonthly;
    private BigDecimal priceAnnual;
    private String features;
    private Integer maxVisitsPerYear;
    private boolean includesTelehealth;
    private boolean isActive;
    private Instant createdAt;
    private Instant modifiedAt;
}
