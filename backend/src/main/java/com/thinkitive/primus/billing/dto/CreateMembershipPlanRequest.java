package com.thinkitive.primus.billing.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateMembershipPlanRequest {

    @NotBlank
    private String name;

    private String description;
    private BigDecimal priceMonthly;
    private BigDecimal priceAnnual;
    private String features;
    private Integer maxVisitsPerYear;
    private boolean includesTelehealth = false;
}
