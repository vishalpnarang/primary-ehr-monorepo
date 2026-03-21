package com.thinkitive.primus.prescription.entity;

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
@Table(name = "medications")
public class Medication extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "drug_name", nullable = false, length = 255)
    private String drugName;

    @Column(name = "generic_name", length = 255)
    private String genericName;

    @Column(name = "strength", length = 100)
    private String strength;

    @Column(name = "dosage_form", length = 100)
    private String dosageForm;

    @Column(name = "directions", length = 500)
    private String directions;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "refills")
    private Integer refills;

    @Column(name = "prescribed_by", length = 150)
    private String prescribedBy;

    @Column(name = "prescribed_at")
    private Instant prescribedAt;

    @Column(name = "pharmacy", length = 255)
    private String pharmacy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private MedicationStatus status;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_controlled", nullable = false)
    private boolean isControlled = false;

    @Column(name = "schedule", length = 10)
    private String schedule;

    public enum MedicationStatus {
        ACTIVE, DISCONTINUED, COMPLETED
    }
}
