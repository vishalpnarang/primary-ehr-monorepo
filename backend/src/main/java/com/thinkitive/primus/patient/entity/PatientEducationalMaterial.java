package com.thinkitive.primus.patient.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "patient_educational_materials")
public class PatientEducationalMaterial extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "material_id", nullable = false)
    private Long materialId;

    @Column(name = "assigned_by", length = 255)
    private String assignedBy;

    @Column(name = "assigned_date")
    private Instant assignedDate;

    @Column(name = "viewed_date")
    private Instant viewedDate;
}
