package com.thinkitive.primus.careplan.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Questionnaire definition — stores questions and optional scoring logic as JSONB.
 *
 * <p>Example {@code questions} structure:
 * <pre>
 * [
 *   {"id": 1, "text": "Little interest or pleasure in doing things?", "type": "LIKERT", "options": ["Not at all", "Several days", "More than half the days", "Nearly every day"]},
 *   ...
 * ]
 * </pre>
 *
 * <p>Example {@code scoringLogic} structure:
 * <pre>
 * {"ranges": [{"min": 0, "max": 4, "riskLevel": "MINIMAL"}, {"min": 5, "max": 9, "riskLevel": "MILD"}, ...]}
 * </pre>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "questionnaire_definitions")
public class QuestionnaireDefinition extends TenantAwareEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", length = 50)
    private QuestionnaireCategory category;

    @Column(name = "questions", nullable = false, columnDefinition = "jsonb")
    private String questions;

    @Column(name = "scoring_logic", columnDefinition = "jsonb")
    private String scoringLogic;

    @Column(name = "is_published", nullable = false)
    private boolean isPublished = false;

    public enum QuestionnaireCategory {
        PHQ9, GAD7, AUDIT, CUSTOM
    }
}
