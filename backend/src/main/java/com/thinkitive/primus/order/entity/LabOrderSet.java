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
@Table(name = "lab_order_sets")
public class LabOrderSet extends TenantAwareEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /** JSON array of test objects: [{testCode, testName, loincCode}] */
    @Column(name = "tests", nullable = false, columnDefinition = "JSONB")
    private String tests;

    /** JSON array of default ICD-10 codes for this order set */
    @Column(name = "default_icd_codes", columnDefinition = "JSONB")
    private String defaultIcdCodes;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
}
