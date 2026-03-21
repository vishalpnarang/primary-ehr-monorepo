package com.thinkitive.primus.billing.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class ClaimDto {

    private String uuid;
    private String claimNumber;
    private String patientUuid;
    private String patientName;
    private String encounterUuid;
    private String providerId;
    private String providerName;
    private String insurancePlanName;
    private String insuranceMemberId;
    private LocalDate serviceDate;
    private List<ClaimLineDto> lines;
    private BigDecimal totalCharges;
    private BigDecimal allowedAmount;
    private BigDecimal paidAmount;
    private BigDecimal patientResponsibility;
    private String status; // DRAFT | SUBMITTED | ACCEPTED | REJECTED | PARTIALLY_PAID | PAID | DENIED | APPEALED
    private String clearinghouse;
    private String denialCode;
    private String denialReason;
    private Instant submittedAt;
    private Instant updatedAt;
}
