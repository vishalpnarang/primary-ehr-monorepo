package com.thinkitive.primus.patient.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "vital_signs")
public class VitalSigns extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "encounter_id")
    private Long encounterId;

    @Column(name = "systolic")
    private Integer systolic;

    @Column(name = "diastolic")
    private Integer diastolic;

    @Column(name = "heart_rate")
    private Integer heartRate;

    @Column(name = "temperature", precision = 5, scale = 1)
    private BigDecimal temperature;

    @Column(name = "o2_saturation", precision = 5, scale = 2)
    private BigDecimal o2Saturation;

    @Column(name = "weight", precision = 6, scale = 2)
    private BigDecimal weight;

    @Column(name = "height", precision = 6, scale = 2)
    private BigDecimal height;

    @Column(name = "bmi", precision = 5, scale = 2)
    private BigDecimal bmi;

    @Column(name = "pain_scale")
    private Integer painScale;

    @Column(name = "respiratory_rate")
    private Integer respiratoryRate;

    @Column(name = "recorded_at")
    private Instant recordedAt;

    @Column(name = "recorded_by", length = 150)
    private String recordedBy;
}
