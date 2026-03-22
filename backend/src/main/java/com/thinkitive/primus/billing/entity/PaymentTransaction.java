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
@Table(name = "payment_transactions")
public class PaymentTransaction extends TenantAwareEntity {

    @Column(name = "invoice_id")
    private Long invoiceId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "method", nullable = false, length = 20)
    private PaymentMethod method;

    @Column(name = "reference_number", length = 255)
    private String referenceNumber;

    @Column(name = "stripe_payment_intent_id", length = 255)
    private String stripePaymentIntentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.COMPLETED;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public enum PaymentMethod {
        CARD, CASH, CHECK, BANK, INSURANCE
    }

    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED, REFUNDED
    }
}
