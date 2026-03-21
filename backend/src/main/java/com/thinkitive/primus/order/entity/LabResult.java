package com.thinkitive.primus.order.entity;

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
@Table(name = "lab_results")
public class LabResult extends TenantAwareEntity {

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "test_name", nullable = false, length = 255)
    private String testName;

    @Column(name = "value", length = 100)
    private String value;

    @Column(name = "unit", length = 50)
    private String unit;

    @Column(name = "reference_range", length = 100)
    private String referenceRange;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private LabResultStatus status;

    @Column(name = "loinc_code", length = 20)
    private String loincCode;

    @Column(name = "result_date")
    private LocalDate resultDate;

    @Column(name = "reviewed_by", length = 150)
    private String reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    public enum LabResultStatus {
        NORMAL, LOW, HIGH, CRITICAL_LOW, CRITICAL_HIGH, PENDING
    }
}
