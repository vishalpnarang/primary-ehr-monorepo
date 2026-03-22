package com.thinkitive.primus.order.entity;

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
@Table(name = "lab_catalog")
public class LabCatalog extends TenantAwareEntity {

    @Column(name = "test_code", nullable = false, length = 50)
    private String testCode;

    @Column(name = "test_name", nullable = false, length = 255)
    private String testName;

    @Column(name = "specimen_type", length = 100)
    private String specimenType;

    @Column(name = "container", length = 100)
    private String container;

    @Column(name = "volume", length = 50)
    private String volume;

    @Column(name = "stability", length = 100)
    private String stability;

    @Column(name = "cpt_code", length = 20)
    private String cptCode;

    @Column(name = "loinc_code", length = 20)
    private String loincCode;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
}
