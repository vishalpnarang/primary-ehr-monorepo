package com.thinkitive.primus.prescription.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "prescriptions")
public class Prescription extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "medication_id", nullable = false)
    private Long medicationId;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "pharmacy_name", length = 255)
    private String pharmacyName;

    @Column(name = "pharmacy_id", length = 100)
    private String pharmacyId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PrescriptionStatus status;

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "filled_at")
    private Instant filledAt;

    public enum PrescriptionStatus {
        PENDING, SENT, FILLED, CANCELLED
    }
}
