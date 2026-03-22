package com.thinkitive.primus.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateInventoryItemRequest {

    private Long formularyId;

    @NotBlank
    private String itemName;

    private String sku;
    private String category;
    private Integer quantityOnHand = 0;
    private Integer reorderLevel = 10;
    private BigDecimal unitCost;
    private Long locationId;
}
