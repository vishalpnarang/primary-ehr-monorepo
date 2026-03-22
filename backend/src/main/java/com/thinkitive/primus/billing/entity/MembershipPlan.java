package com.thinkitive.primus.billing.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "membership_plans")
public class MembershipPlan extends TenantAwareEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price_monthly", precision = 10, scale = 2)
    private BigDecimal priceMonthly;

    @Column(name = "price_annual", precision = 10, scale = 2)
    private BigDecimal priceAnnual;

    /** JSON array of feature strings */
    @Column(name = "features", columnDefinition = "JSONB")
    private String features;

    @Column(name = "max_visits_per_year")
    private Integer maxVisitsPerYear;

    @Column(name = "includes_telehealth", nullable = false)
    private boolean includesTelehealth = false;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
}
