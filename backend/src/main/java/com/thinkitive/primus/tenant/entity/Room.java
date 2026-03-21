package com.thinkitive.primus.tenant.entity;

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
@Table(name = "rooms")
public class Room extends TenantAwareEntity {

    @Column(name = "location_id", nullable = false)
    private Long locationId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RoomStatus status;

    public enum RoomStatus {
        AVAILABLE, OCCUPIED, CLEANING, BLOCKED
    }
}
