package com.thinkitive.primus.patient.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "problems")
public class Problem extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "description", nullable = false, length = 500)
    private String description;

    @Column(name = "icd_code", length = 20)
    private String icdCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ProblemStatus status;

    @Column(name = "onset_date")
    private LocalDate onsetDate;

    @Column(name = "resolved_date")
    private LocalDate resolvedDate;

    @Column(name = "added_by", length = 150)
    private String addedBy;

    @Column(name = "added_at")
    private Instant addedAt;

    public enum ProblemStatus {
        ACTIVE, RESOLVED, INACTIVE
    }
}
