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
    name = "status_configurations",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_status_configurations_tenant_transition",
        columnNames = {"tenant_id", "name", "from_status", "to_status"}
    )
)
public class StatusConfiguration extends TenantAwareEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "from_status", nullable = false, length = 50)
    private String fromStatus;

    @Column(name = "to_status", nullable = false, length = 50)
    private String toStatus;

    /**
     * Comma-separated list of roles permitted to execute this transition.
     * e.g. "ROLE_NURSE,ROLE_PROVIDER"
     */
    @Column(name = "allowed_roles", columnDefinition = "TEXT")
    private String allowedRoles;

    /**
     * Hex color code for UI badge, e.g. "#22C55E".
     */
    @Column(name = "color", length = 7)
    private String color;

    @Column(name = "display_order")
    private Integer displayOrder;
}
