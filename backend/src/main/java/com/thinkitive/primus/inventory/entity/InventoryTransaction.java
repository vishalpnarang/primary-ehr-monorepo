package com.thinkitive.primus.inventory.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "inventory_transactions")
public class InventoryTransaction extends TenantAwareEntity {

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 20)
    private TransactionType transactionType;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "performed_by", length = 255)
    private String performedBy;

    public enum TransactionType {
        RECEIPT, DISPENSE, ADJUSTMENT, TRANSFER
    }
}
