package com.thinkitive.primus.encounter.entity;

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
@Table(name = "patient_visits")
public class PatientVisit extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "encounter_id")
    private Long encounterId;

    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "check_in_time")
    private Instant checkInTime;

    @Column(name = "rooming_time")
    private Instant roomingTime;

    @Column(name = "provider_start_time")
    private Instant providerStartTime;

    @Column(name = "checkout_time")
    private Instant checkoutTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private VisitStatus status = VisitStatus.CHECKED_IN;

    public enum VisitStatus {
        CHECKED_IN, ROOMED, WITH_PROVIDER, CHECKOUT, COMPLETED, CANCELLED
    }
}
