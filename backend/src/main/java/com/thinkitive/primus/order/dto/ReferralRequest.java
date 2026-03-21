package com.thinkitive.primus.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;


@Data
public class ReferralRequest {

    @NotNull  private String patientUuid;
    @NotNull  private String encounterUuid;
    @NotBlank private String specialtyType; // CARDIOLOGY | DERMATOLOGY | etc.
    private String referredProviderName;
    private String referredProviderNpi;
    private String icd10Code;
    private String clinicalReason;
    private String priority;
    private String notes;
}
