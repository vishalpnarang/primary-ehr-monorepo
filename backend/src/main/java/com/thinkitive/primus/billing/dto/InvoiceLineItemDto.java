package com.thinkitive.primus.billing.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class InvoiceLineItemDto {

    private String uuid;
    private Long invoiceId;
    private String description;
    private String cptCode;
    private String icdCodes;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal amount;
    private Instant createdAt;
    private Instant modifiedAt;
}
