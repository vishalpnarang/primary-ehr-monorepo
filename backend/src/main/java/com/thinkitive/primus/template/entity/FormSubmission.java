package com.thinkitive.primus.template.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.Instant;

/**
 * A patient's submitted response to a form template.
 * submission_data stores the filled FormValues as JSONB.
 * Status lifecycle: SUBMITTED → REVIEWED → ARCHIVED.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "form_submissions")
public class FormSubmission extends TenantAwareEntity {

    @Column(name = "template_id", nullable = false)
    private Long templateId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "submitted_by", nullable = false, length = 255)
    private String submittedBy;

    /**
     * Serialized JSON map of fieldId → value as submitted by the patient/user.
     * Stored as JSONB in PostgreSQL.
     */
    @Column(name = "submission_data", columnDefinition = "jsonb", nullable = false)
    private String submissionData;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private SubmissionStatus status = SubmissionStatus.SUBMITTED;

    @Column(name = "reviewed_by", length = 255)
    private String reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    public enum SubmissionStatus {
        SUBMITTED, REVIEWED, ARCHIVED
    }
}
