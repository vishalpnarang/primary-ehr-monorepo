package com.thinkitive.primus.auth.entity;

import com.thinkitive.primus.shared.entity.AuditableEntity;
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
        name = "permissions",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_permission_name",
                columnNames = {"name"}
        )
)
public class Permission extends AuditableEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "module", length = 100)
    private String module;

    @Column(name = "action", length = 50)
    private String action;
}
