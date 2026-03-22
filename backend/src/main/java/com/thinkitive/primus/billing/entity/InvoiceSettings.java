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
@Table(name = "invoice_settings")
public class InvoiceSettings extends TenantAwareEntity {

    @Column(name = "billing_name", length = 255)
    private String billingName;

    @Column(name = "billing_address", columnDefinition = "TEXT")
    private String billingAddress;

    @Column(name = "tax_rate", precision = 5, scale = 2)
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Column(name = "payment_terms_days")
    private Integer paymentTermsDays = 30;

    @Column(name = "auto_send", nullable = false)
    private boolean autoSend = false;

    @Column(name = "late_fee_rate", precision = 5, scale = 2)
    private BigDecimal lateFeeRate = BigDecimal.ZERO;
}
