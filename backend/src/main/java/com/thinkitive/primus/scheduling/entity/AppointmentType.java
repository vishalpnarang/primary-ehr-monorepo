package com.thinkitive.primus.scheduling.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(
    name = "appointment_types",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_appointment_types_tenant_name",
        columnNames = {"tenant_id", "name"}
    )
)
public class AppointmentType extends TenantAwareEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes = 30;

    @Column(name = "color", length = 7)
    private String color;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "allow_online_booking")
    private boolean allowOnlineBooking = false;
}
