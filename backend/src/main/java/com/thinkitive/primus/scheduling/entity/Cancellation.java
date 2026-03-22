package com.thinkitive.primus.scheduling.entity;

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
@Table(name = "cancellations")
public class Cancellation extends TenantAwareEntity {

    @Column(name = "appointment_id", nullable = false)
    private Long appointmentId;

    @Column(name = "cancelled_by", nullable = false, length = 255)
    private String cancelledBy;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "cancelled_at", nullable = false)
    private Instant cancelledAt;

    @Column(name = "is_no_show")
    private boolean isNoShow = false;
}
