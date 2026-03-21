package com.thinkitive.primus.order.entity;

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
@Table(name = "referrals")
public class Referral extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "referring_provider_id", nullable = false)
    private Long referringProviderId;

    @Column(name = "specialty", nullable = false, length = 100)
    private String specialty;

    @Column(name = "referred_to", length = 255)
    private String referredTo;

    @Enumerated(EnumType.STRING)
    @Column(name = "urgency", nullable = false, length = 10)
    private ReferralUrgency urgency;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "clinical_notes", columnDefinition = "TEXT")
    private String clinicalNotes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReferralStatus status;

    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;

    public enum ReferralUrgency {
        ROUTINE, URGENT, EMERGENT
    }

    public enum ReferralStatus {
        DRAFT, SENT, SCHEDULED, COMPLETED, CANCELLED
    }
}
