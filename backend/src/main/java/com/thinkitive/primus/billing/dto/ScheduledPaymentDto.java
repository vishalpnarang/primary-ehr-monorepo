package com.thinkitive.primus.billing.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
public class ScheduledPaymentDto {

    private String uuid;
    private Long patientId;
    private Long invoiceId;
    private Long paymentMethodId;
    private BigDecimal amount;
    private LocalDate scheduledDate;
    private String status;
    private Instant createdAt;
    private Instant modifiedAt;
}
