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
@Table(name = "soap_note_templates")
public class SoapNoteTemplate extends TenantAwareEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", length = 50)
    private TemplateCategory category;

    @Column(name = "subjective_template", columnDefinition = "TEXT")
    private String subjectiveTemplate;

    @Column(name = "objective_template", columnDefinition = "TEXT")
    private String objectiveTemplate;

    @Column(name = "assessment_template", columnDefinition = "TEXT")
    private String assessmentTemplate;

    @Column(name = "plan_template", columnDefinition = "TEXT")
    private String planTemplate;

    @Column(name = "is_default", nullable = false)
    private boolean isDefault = false;

    public enum TemplateCategory {
        H_AND_P, PROGRESS, FOLLOW_UP, PROCEDURE, TELEHEALTH
    }
}
