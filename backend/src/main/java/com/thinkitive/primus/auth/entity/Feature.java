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
        name = "features",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_feature_tenant_name",
                columnNames = {"tenant_id", "name"}
        )
)
public class Feature extends TenantAwareEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    @Column(name = "module", length = 100)
    private String module;
}
