package com.thinkitive.primus.order.entity;

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
@Table(name = "poc_results")
public class PocResult extends TenantAwareEntity {

    @Column(name = "poc_test_id", nullable = false)
    private Long pocTestId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "encounter_id")
    private Long encounterId;

    /** JSON map of field values: {fieldName: value} */
    @Column(name = "results", nullable = false, columnDefinition = "JSONB")
    private String results;

    @Column(name = "performed_by", length = 255)
    private String performedBy;

    @Column(name = "performed_at", nullable = false)
    private Instant performedAt;
}
