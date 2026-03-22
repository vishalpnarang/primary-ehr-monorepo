package com.thinkitive.primus.template.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Review-of-systems template. The {@code systems} column stores a JSON array of
 * {@code {system: string, findings: string[]}} objects.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "ros_templates")
public class RosTemplate extends TenantAwareEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    /**
     * JSON array: [{system: "Constitutional", findings: ["No fever", "No fatigue"]}, ...]
     * Stored as JSONB in PostgreSQL.
     */
    @Column(name = "systems", nullable = false, columnDefinition = "jsonb")
    private String systems;

    @Column(name = "is_default", nullable = false)
    private boolean isDefault = false;
}
