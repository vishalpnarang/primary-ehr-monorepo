package com.thinkitive.primus.template.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Physical exam template. The {@code sections} column stores a JSON array of
 * {@code {section: string, findings: string[]}} objects.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "physical_exam_templates")
public class PhysicalExamTemplate extends TenantAwareEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    /**
     * JSON array: [{section: "General", findings: ["Alert and oriented", "Well-nourished"]}, ...]
     * Stored as JSONB in PostgreSQL.
     */
    @Column(name = "sections", nullable = false, columnDefinition = "jsonb")
    private String sections;

    @Column(name = "is_default", nullable = false)
    private boolean isDefault = false;
}
