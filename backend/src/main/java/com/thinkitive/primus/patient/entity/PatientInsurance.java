package com.thinkitive.primus.patient.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "patient_insurances")
public class PatientInsurance extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "payer_name", nullable = false, length = 255)
    private String payerName;

    @Column(name = "payer_id", length = 50)
    private String payerId;

    @Column(name = "member_id", length = 100)
    private String memberId;

    @Column(name = "group_number", length = 100)
    private String groupNumber;

    @Column(name = "plan_type", length = 50)
    private String planType;

    @Column(name = "copay", precision = 10, scale = 2)
    private BigDecimal copay;

    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary = false;

    @Column(name = "verified", nullable = false)
    private boolean verified = false;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "card_front_url", length = 500)
    private String cardFrontUrl;

    @Column(name = "card_back_url", length = 500)
    private String cardBackUrl;
}
