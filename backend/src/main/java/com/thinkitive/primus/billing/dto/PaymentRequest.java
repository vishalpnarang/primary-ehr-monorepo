package com.thinkitive.primus.billing.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentRequest {

    @NotNull private String claimUuid;
    @NotNull private BigDecimal amount;
    @NotNull private LocalDate paymentDate;
    private String paymentMethod; // ERA | CHECK | PATIENT_CARD | PATIENT_CASH
    private String referenceNumber;
    private String notes;
}
