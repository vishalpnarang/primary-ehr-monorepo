package com.thinkitive.primus.billing.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SchedulePaymentRequest {

    @NotNull
    private Long patientId;

    @NotNull
    private Long invoiceId;

    private Long paymentMethodId;

    @NotNull
    private BigDecimal amount;

    @NotNull
    private LocalDate scheduledDate;
}
