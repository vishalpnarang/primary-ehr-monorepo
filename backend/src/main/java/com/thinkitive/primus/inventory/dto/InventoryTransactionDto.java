package com.thinkitive.primus.inventory.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class InventoryTransactionDto {

    private String uuid;
    private Long itemId;
    private String transactionType;
    private Integer quantity;
    private String referenceNumber;
    private String notes;
    private String performedBy;
    private Instant createdAt;
    private Instant modifiedAt;
}
