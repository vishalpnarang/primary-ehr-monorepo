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
@Table(name = "care_gaps")
public class CareGap extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "measure", nullable = false, length = 100)
    private String measure;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "last_date")
    private LocalDate lastDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CareGapStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 10)
    private CareGapPriority priority;

    public enum CareGapStatus {
        OPEN, CLOSED, DECLINED
    }

    public enum CareGapPriority {
        HIGH, MEDIUM, LOW
    }
}
