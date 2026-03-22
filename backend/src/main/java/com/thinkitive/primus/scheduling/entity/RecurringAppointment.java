package com.thinkitive.primus.scheduling.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "recurring_appointments")
public class RecurringAppointment extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    /**
     * Keycloak sub / user UUID of the provider.
     */
    @Column(name = "provider_id", nullable = false, length = 36)
    private String providerId;

    @Column(name = "appointment_type_id")
    private Long appointmentTypeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "recurrence_pattern", nullable = false, length = 50)
    private RecurrencePattern recurrencePattern;

    /**
     * 0 = Sunday, 1 = Monday, ..., 6 = Saturday. Nullable when recurrence does not fix a day.
     */
    @Column(name = "day_of_week")
    private Integer dayOfWeek;

    @Column(name = "preferred_time")
    private LocalTime preferredTime;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private RecurringStatus status = RecurringStatus.ACTIVE;

    public enum RecurrencePattern {
        WEEKLY, BIWEEKLY, MONTHLY
    }

    public enum RecurringStatus {
        ACTIVE, PAUSED, COMPLETED, CANCELLED
    }
}
