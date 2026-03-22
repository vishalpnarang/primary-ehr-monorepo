package com.thinkitive.primus.inventory.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class InventoryItemDto {

    private String uuid;
    private Long formularyId;
    private String itemName;
    private String sku;
    private String category;
    private Integer quantityOnHand;
    private Integer reorderLevel;
    private BigDecimal unitCost;
    private Long locationId;
    private boolean lowStock;
    private Instant createdAt;
    private Instant modifiedAt;
}
