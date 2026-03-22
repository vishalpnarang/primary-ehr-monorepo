package com.thinkitive.primus.inventory.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "inventory_items")
public class InventoryItem extends TenantAwareEntity {

    @Column(name = "formulary_id")
    private Long formularyId;

    @Column(name = "item_name", nullable = false, length = 255)
    private String itemName;

    @Column(name = "sku", length = 50)
    private String sku;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "quantity_on_hand", nullable = false)
    private Integer quantityOnHand = 0;

    @Column(name = "reorder_level", nullable = false)
    private Integer reorderLevel = 10;

    @Column(name = "unit_cost", precision = 10, scale = 2)
    private BigDecimal unitCost;

    @Column(name = "location_id")
    private Long locationId;
}
