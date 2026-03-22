package com.thinkitive.primus.inventory.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateInventoryItemRequest {

    private String itemName;
    private String sku;
    private String category;
    private Integer quantityOnHand;
    private Integer reorderLevel;
    private BigDecimal unitCost;
    private Long locationId;
}
