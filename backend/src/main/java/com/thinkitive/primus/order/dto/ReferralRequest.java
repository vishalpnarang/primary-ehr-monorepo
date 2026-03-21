package com.thinkitive.primus.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ReferralRequest {

    @NotNull  private UUID patientUuid;
    @NotNull  private UUID encounterUuid;
    @NotBlank private String specialtyType; // CARDIOLOGY | DERMATOLOGY | etc.
    private String referredProviderName;
    private String referredProviderNpi;
    private String icd10Code;
    private String clinicalReason;
    private String priority;
    private String notes;
}
