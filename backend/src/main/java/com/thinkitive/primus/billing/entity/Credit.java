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
@Table(name = "credits")
public class Credit extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "reason", length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 20)
    private CreditType type;

    @Column(name = "applied_to_invoice_id")
    private Long appliedToInvoiceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CreditStatus status = CreditStatus.AVAILABLE;

    public enum CreditType {
        OVERPAYMENT, ADJUSTMENT, REFUND, PROMOTIONAL
    }

    public enum CreditStatus {
        AVAILABLE, APPLIED, EXPIRED
    }
}
