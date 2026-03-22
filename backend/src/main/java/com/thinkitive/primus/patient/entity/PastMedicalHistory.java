package com.thinkitive.primus.patient.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "past_medical_history")
public class PastMedicalHistory extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "condition", nullable = false, length = 255)
    private String condition;

    @Column(name = "icd10_code", length = 20)
    private String icd10Code;

    @Column(name = "onset_date")
    private LocalDate onsetDate;

    @Column(name = "resolution_date")
    private LocalDate resolutionDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private ConditionStatus status = ConditionStatus.ACTIVE;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public enum ConditionStatus {
        ACTIVE, RESOLVED, CHRONIC
    }
}
