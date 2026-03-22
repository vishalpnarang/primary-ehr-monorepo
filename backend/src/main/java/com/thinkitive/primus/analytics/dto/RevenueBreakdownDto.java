package com.thinkitive.primus.analytics.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class RevenueBreakdownDto {

    private BigDecimal totalBilled;
    private BigDecimal totalCollected;
    private BigDecimal totalOutstanding;
    private BigDecimal totalWriteOff;
    private long totalClaims;
    private long pendingClaims;
    private long deniedClaims;
    private double collectionRate;
}
