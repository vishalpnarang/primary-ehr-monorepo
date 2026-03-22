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
@Table(name = "patient_flags")
public class PatientFlag extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Enumerated(EnumType.STRING)
    @Column(name = "flag_type", nullable = false, length = 50)
    private FlagType flagType;

    @Column(name = "label", nullable = false, length = 255)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", length = 20)
    private FlagSeverity severity;

    @Column(name = "active")
    private boolean active = true;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public enum FlagType {
        HIGH_RISK, FALL_RISK, DNR, CARE_GAP, OUTSTANDING_BALANCE
    }

    public enum FlagSeverity {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}
