package com.thinkitive.primus.billing.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class InvoiceDto {

    private String uuid;
    private Long patientId;
    private Long encounterId;
    private String invoiceNumber;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal discount;
    private BigDecimal total;
    private BigDecimal amountPaid;
    private BigDecimal balanceDue;
    private String status;
    private LocalDate dueDate;
    private LocalDate sentDate;
    private List<InvoiceLineItemDto> lineItems;
    private Instant createdAt;
    private Instant modifiedAt;
}
