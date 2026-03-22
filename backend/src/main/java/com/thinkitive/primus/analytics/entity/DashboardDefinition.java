package com.thinkitive.primus.analytics.entity;

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
@Table(name = "dashboard_definitions")
public class DashboardDefinition extends TenantAwareEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", length = 50)
    private DashboardCategory category;

    @Column(name = "query_config", nullable = false, columnDefinition = "JSONB")
    private String queryConfig;

    @Column(name = "chart_type", length = 50)
    private String chartType;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "roles_allowed", columnDefinition = "JSONB")
    private String rolesAllowed;

    public enum DashboardCategory {
        CLINICAL, OPERATIONAL, FINANCIAL, POPULATION
    }
}
