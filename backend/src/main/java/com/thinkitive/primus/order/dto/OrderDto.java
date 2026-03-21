package com.thinkitive.primus.order.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class OrderDto {

    private String uuid;
    private String orderType;  // LAB | IMAGING | REFERRAL
    private String patientUuid;
    private String patientName;
    private String encounterUuid;
    private String orderingProviderId;
    private String orderingProviderName;
    private String status; // PENDING | SENT | RESULTED | REVIEWED | CANCELLED
    private String priority;
    private String notes;

    // LAB-specific
    private String lab;
    private List<String> tests;
    private boolean fasting;

    // IMAGING-specific
    private String modality;
    private String bodyPart;
    private String laterality;

    // REFERRAL-specific
    private String specialtyType;
    private String referredProviderName;
    private String referredProviderNpi;

    private String icd10Code;
    private Instant orderedAt;
    private Instant resultedAt;
}
