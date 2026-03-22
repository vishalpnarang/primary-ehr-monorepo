package com.thinkitive.primus.billing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EnrollPatientRequest {

    @NotNull
    private Long patientId;

    @NotNull
    private LocalDate startDate;

    @NotBlank
    private String billingInterval;

    private String stripeSubscriptionId;
}
