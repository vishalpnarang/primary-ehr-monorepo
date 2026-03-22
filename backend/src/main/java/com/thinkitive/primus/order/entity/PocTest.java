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
@Table(name = "poc_tests")
public class PocTest extends TenantAwareEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "category", length = 100)
    private String category;

    /** JSON schema defining result fields: [{fieldName, fieldType, unit}] */
    @Column(name = "result_fields", nullable = false, columnDefinition = "JSONB")
    private String resultFields;

    /** JSON map of normal ranges: {fieldName: {min, max, unit}} */
    @Column(name = "normal_ranges", columnDefinition = "JSONB")
    private String normalRanges;

    @Column(name = "cpt_code", length = 20)
    private String cptCode;
}
