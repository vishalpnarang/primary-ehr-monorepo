package com.thinkitive.primus.billing.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "scheduled_payments")
public class ScheduledPayment extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "invoice_id", nullable = false)
    private Long invoiceId;

    @Column(name = "payment_method_id")
    private Long paymentMethodId;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ScheduledPaymentStatus status = ScheduledPaymentStatus.SCHEDULED;

    public enum ScheduledPaymentStatus {
        SCHEDULED, PROCESSED, FAILED, CANCELLED
    }
}
