package com.thinkitive.primus.auth.entity;

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
        name = "roles",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_role_tenant_name",
                columnNames = {"tenant_id", "name"}
        )
)
public class Role extends TenantAwareEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_system", nullable = false)
    private boolean system = false;

    @Column(name = "status", length = 20)
    private String status = "ACTIVE";
}
