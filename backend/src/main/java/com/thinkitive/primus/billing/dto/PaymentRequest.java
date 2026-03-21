package com.thinkitive.primus.billing.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PaymentRequest {

    @NotNull private UUID claimUuid;
    @NotNull private BigDecimal amount;
    @NotNull private LocalDate paymentDate;
    private String paymentMethod; // ERA | CHECK | PATIENT_CARD | PATIENT_CASH
    private String referenceNumber;
    private String notes;
}
