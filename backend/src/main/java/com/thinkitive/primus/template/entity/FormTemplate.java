package com.thinkitive.primus.template.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Dynamic form template entity.
 * The schema_data column stores the JSON form schema (FormSchema from the UI library).
 * Status lifecycle: DRAFT → PUBLISHED → ARCHIVED.
 * Category is one of: INTAKE, CONSENT, ASSESSMENT, CUSTOM.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "form_templates")
public class FormTemplate extends TenantAwareEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 100)
    private TemplateCategory category;

    /**
     * Serialized JSON representation of FormSchema.
     * Stored as JSONB in PostgreSQL for querying flexibility.
     */
    @Column(name = "schema_data", columnDefinition = "jsonb", nullable = false)
    private String schemaData;

    @Column(name = "version", nullable = false)
    @Builder.Default
    private Integer version = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private TemplateStatus status = TemplateStatus.DRAFT;

    public enum TemplateCategory {
        INTAKE, CONSENT, ASSESSMENT, CUSTOM
    }

    public enum TemplateStatus {
        DRAFT, PUBLISHED, ARCHIVED
    }
}
