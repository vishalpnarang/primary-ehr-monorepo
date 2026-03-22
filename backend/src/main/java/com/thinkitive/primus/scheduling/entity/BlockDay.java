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
@Table(name = "block_days")
public class BlockDay extends TenantAwareEntity {

    /**
     * Keycloak sub / user UUID of the provider.
     */
    @Column(name = "provider_id", nullable = false, length = 36)
    private String providerId;

    @Column(name = "block_date", nullable = false)
    private LocalDate blockDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "reason", length = 255)
    private String reason;

    @Column(name = "is_all_day")
    private boolean isAllDay = true;
}
