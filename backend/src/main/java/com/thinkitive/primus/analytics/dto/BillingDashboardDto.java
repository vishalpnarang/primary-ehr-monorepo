package com.thinkitive.primus.analytics.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class BillingDashboardDto {

    private BigDecimal totalArAmount;
    private BigDecimal collectedThisMonth;
    private double cleanClaimRate;
    private double denialRate;
    private int claimsPendingSubmission;
    private int claimsDenied;
    private int claimsNeedingAttention;
    private BigDecimal days30Ar;
    private BigDecimal days60Ar;
    private BigDecimal days90PlusAr;
}
