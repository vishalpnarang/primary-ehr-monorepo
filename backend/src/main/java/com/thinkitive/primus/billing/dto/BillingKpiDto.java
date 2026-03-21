package com.thinkitive.primus.billing.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class BillingKpiDto {

    private BigDecimal totalCharges;
    private BigDecimal totalCollected;
    private BigDecimal totalAr;
    private double cleanClaimRate;         // % first-pass acceptance
    private double denialRate;
    private double collectionRate;
    private BigDecimal avgDaysToPayment;
    private int totalClaimsSubmitted;
    private int totalClaimsDenied;
    private int totalClaimsAppealed;
}
