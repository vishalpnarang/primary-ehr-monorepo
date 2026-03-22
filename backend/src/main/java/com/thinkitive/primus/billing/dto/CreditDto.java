package com.thinkitive.primus.billing.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class CreditDto {

    private String uuid;
    private Long patientId;
    private BigDecimal amount;
    private String reason;
    private String type;
    private Long appliedToInvoiceId;
    private String status;
    private Instant createdAt;
    private Instant modifiedAt;
}
