package com.thinkitive.primus.billing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RecordPaymentRequest {

    private Long invoiceId;

    @NotNull
    private Long patientId;

    @NotNull
    private BigDecimal amount;

    @NotBlank
    private String method;

    private String referenceNumber;
    private String stripePaymentIntentId;
    private String notes;
}
