package com.thinkitive.primus.scheduling.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "appointments")
public class Appointment extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "location_id", nullable = false)
    private Long locationId;

    @Column(name = "room_id")
    private Long roomId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private AppointmentType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AppointmentStatus status;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "duration", nullable = false)
    private Integer duration;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "intake_completed", nullable = false)
    private boolean intakeCompleted = false;

    @Column(name = "insurance_verified", nullable = false)
    private boolean insuranceVerified = false;

    @Column(name = "telehealth", nullable = false)
    private boolean telehealth = false;

    @Column(name = "balance", precision = 10, scale = 2)
    private BigDecimal balance;

    public enum AppointmentType {
        NEW_PATIENT, FOLLOW_UP, ANNUAL_WELLNESS, TELEHEALTH, URGENT, PROCEDURE, BLOCKED
    }

    public enum AppointmentStatus {
        SCHEDULED, CONFIRMED, ARRIVED, IN_ROOM, IN_PROGRESS, COMPLETED, NO_SHOW, CANCELLED
    }
}
