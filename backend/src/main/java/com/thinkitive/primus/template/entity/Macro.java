package com.thinkitive.primus.template.entity;

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
@Table(name = "macros")
public class Macro extends TenantAwareEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "abbreviation", nullable = false, length = 50)
    private String abbreviation;

    @Column(name = "expansion", nullable = false, columnDefinition = "TEXT")
    private String expansion;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", length = 50)
    private MacroCategory category;

    @Column(name = "is_shared", nullable = false)
    private boolean isShared = false;

    @Column(name = "created_by_provider", length = 36)
    private String createdByProvider;

    public enum MacroCategory {
        SOAP, HPI, ROS, PE, AP, GENERAL
    }
}
