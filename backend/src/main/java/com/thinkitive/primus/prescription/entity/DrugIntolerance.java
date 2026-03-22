package com.thinkitive.primus.prescription.entity;

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
@Table(name = "drug_intolerances")
public class DrugIntolerance extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "drug_name", nullable = false, length = 255)
    private String drugName;

    @Column(name = "rxnorm_code", length = 20)
    private String rxnormCode;

    @Column(name = "reaction", length = 500)
    private String reaction;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", length = 20)
    private Severity severity;

    @Column(name = "onset_date")
    private LocalDate onsetDate;

    public enum Severity {
        MILD, MODERATE, SEVERE
    }
}
