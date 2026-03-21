package com.thinkitive.primus.billing.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ClaimDto {

    private UUID uuid;
    private String claimNumber;
    private UUID patientUuid;
    private String patientName;
    private UUID encounterUuid;
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
