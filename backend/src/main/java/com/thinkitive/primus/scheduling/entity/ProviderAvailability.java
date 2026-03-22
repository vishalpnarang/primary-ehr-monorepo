package com.thinkitive.primus.scheduling.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "provider_availability")
public class ProviderAvailability extends TenantAwareEntity {

    /**
     * Keycloak sub / user UUID of the provider.
     */
    @Column(name = "provider_id", nullable = false, length = 36)
    private String providerId;

    /**
     * 0 = Sunday, 1 = Monday, ..., 6 = Saturday (ISO-compatible via Calendar convention).
     */
    @Column(name = "day_of_week", nullable = false)
    private int dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "location_id")
    private Long locationId;

    @Column(name = "appointment_type_id")
    private Long appointmentTypeId;

    @Column(name = "is_active")
    private boolean isActive = true;
}
