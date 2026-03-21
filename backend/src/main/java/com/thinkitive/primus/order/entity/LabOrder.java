package com.thinkitive.primus.order.entity;

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
@Table(name = "lab_orders")
public class LabOrder extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "facility", length = 255)
    private String facility;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 10)
    private LabPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private LabOrderStatus status;

    @Column(name = "ordered_at")
    private Instant orderedAt;

    @Column(name = "resulted_at")
    private Instant resultedAt;

    @Column(name = "indication", length = 500)
    private String indication;

    public enum LabPriority {
        ROUTINE, STAT
    }

    public enum LabOrderStatus {
        PENDING, COLLECTED, IN_PROGRESS, RESULTED, REVIEWED
    }
}
