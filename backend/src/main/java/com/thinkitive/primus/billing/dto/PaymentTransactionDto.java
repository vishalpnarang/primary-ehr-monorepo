package com.thinkitive.primus.billing.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class PaymentTransactionDto {

    private String uuid;
    private Long invoiceId;
    private Long patientId;
    private BigDecimal amount;
    private String method;
    private String referenceNumber;
    private String stripePaymentIntentId;
    private String status;
    private String notes;
    private Instant createdAt;
    private Instant modifiedAt;
}
