package com.thinkitive.primus.careplan.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.Instant;

/**
 * A single patient's response to a questionnaire definition.
 *
 * <p>Example {@code responses} structure:
 * <pre>
 * {"answers": [{"questionId": 1, "answer": "Several days", "score": 1}, ...]}
 * </pre>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "questionnaire_responses")
public class QuestionnaireResponse extends TenantAwareEntity {

    @Column(name = "questionnaire_id", nullable = false)
    private Long questionnaireId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    /** Optional — links response to the encounter during which it was completed. */
    @Column(name = "encounter_id")
    private Long encounterId;

    @Column(name = "responses", nullable = false, columnDefinition = "jsonb")
    private String responses;

    @Column(name = "total_score")
    private Integer totalScore;

    @Column(name = "risk_level", length = 20)
    private String riskLevel;

    /** UUID of the user (patient or staff) who submitted the response. */
    @Column(name = "completed_by", length = 36)
    private String completedBy;

    @Column(name = "completed_at")
    private Instant completedAt;
}
