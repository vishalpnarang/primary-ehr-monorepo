package com.thinkitive.primus.billing.entity;

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
@Table(name = "invoice_line_items")
public class InvoiceLineItem extends TenantAwareEntity {

    @Column(name = "invoice_id", nullable = false)
    private Long invoiceId;

    @Column(name = "description", nullable = false, length = 500)
    private String description;

    @Column(name = "cpt_code", length = 20)
    private String cptCode;

    /** JSON array of ICD-10 diagnosis codes */
    @Column(name = "icd_codes", columnDefinition = "JSONB")
    private String icdCodes;

    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
}
