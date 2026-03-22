package com.thinkitive.primus.patient.entity;

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
@Table(
    name = "social_history",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_social_history_patient_tenant",
        columnNames = {"patient_id", "tenant_id"}
    )
)
public class SocialHistory extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "smoking_status", length = 50)
    private String smokingStatus;

    @Column(name = "alcohol_use", length = 50)
    private String alcoholUse;

    @Column(name = "drug_use", length = 50)
    private String drugUse;

    @Column(name = "exercise_frequency", length = 50)
    private String exerciseFrequency;

    @Column(name = "diet", length = 100)
    private String diet;

    @Column(name = "occupation", length = 255)
    private String occupation;

    @Column(name = "education_level", length = 100)
    private String educationLevel;

    @Column(name = "marital_status", length = 50)
    private String maritalStatus;

    @Column(name = "sexual_orientation", length = 50)
    private String sexualOrientation;

    @Column(name = "gender_identity", length = 50)
    private String genderIdentity;

    @Column(name = "housing_status", length = 50)
    private String housingStatus;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
