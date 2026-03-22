package com.thinkitive.primus.billing.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ApplyCreditRequest {

    @NotNull
    private Long patientId;

    @NotNull
    private BigDecimal amount;

    private String reason;
    private String type;
    private Long appliedToInvoiceId;
}
