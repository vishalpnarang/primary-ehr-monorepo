package com.thinkitive.primus.billing.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "claims")
public class Claim extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "encounter_id", nullable = false)
    private Long encounterId;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "date_of_service", nullable = false)
    private LocalDate dateOfService;

    @Column(name = "payer_name", nullable = false, length = 255)
    private String payerName;

    @Column(name = "payer_id", length = 50)
    private String payerId;

    @Column(name = "total_charge", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalCharge;

    @Column(name = "allowed_amount", precision = 12, scale = 2)
    private BigDecimal allowedAmount;

    @Column(name = "paid_amount", precision = 12, scale = 2)
    private BigDecimal paidAmount;

    @Column(name = "patient_responsibility", precision = 12, scale = 2)
    private BigDecimal patientResponsibility;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ClaimStatus status;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "denial_reason", length = 500)
    private String denialReason;

    @Column(name = "denial_code", length = 20)
    private String denialCode;

    public enum ClaimStatus {
        READY, SUBMITTED, ACCEPTED, PAID, DENIED, APPEALED
    }
}
