package com.thinkitive.primus.billing.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
public class PlanEnrollmentDto {

    private String uuid;
    private Long patientId;
    private String planUuid;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String billingInterval;
    private String stripeSubscriptionId;
    private Instant createdAt;
    private Instant modifiedAt;
}
