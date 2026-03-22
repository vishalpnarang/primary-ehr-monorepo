package com.thinkitive.primus.billing.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "plan_enrollments")
public class PlanEnrollment extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "plan_id", nullable = false)
    private Long planId;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_interval", nullable = false, length = 20)
    private BillingInterval billingInterval = BillingInterval.MONTHLY;

    @Column(name = "stripe_subscription_id", length = 255)
    private String stripeSubscriptionId;

    public enum EnrollmentStatus {
        ACTIVE, CANCELLED, EXPIRED, SUSPENDED
    }

    public enum BillingInterval {
        MONTHLY, ANNUAL
    }
}
