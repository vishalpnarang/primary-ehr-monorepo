package com.thinkitive.primus.prescription.entity;

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
@Table(name = "formulary")
public class Formulary extends TenantAwareEntity {

    @Column(name = "drug_name", nullable = false, length = 255)
    private String drugName;

    @Column(name = "generic_name", length = 255)
    private String genericName;

    @Column(name = "ndc", length = 20)
    private String ndc;

    @Column(name = "rxnorm_code", length = 20)
    private String rxnormCode;

    @Column(name = "strength", length = 100)
    private String strength;

    @Column(name = "form", length = 50)
    private String form;

    @Column(name = "route", length = 50)
    private String route;

    @Column(name = "drug_class", length = 100)
    private String drugClass;

    /** DEA Schedule: C2, C3, C4, C5, or null for non-controlled */
    @Column(name = "schedule", length = 10)
    private String schedule;

    @Column(name = "requires_pa", nullable = false)
    private boolean requiresPa = false;

    @Column(name = "tier")
    private Integer tier;

    @Column(name = "cost", precision = 10, scale = 2)
    private BigDecimal cost;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
}
