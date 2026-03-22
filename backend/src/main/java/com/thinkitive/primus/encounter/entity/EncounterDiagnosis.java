package com.thinkitive.primus.encounter.entity;

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
@Table(name = "encounter_diagnoses")
public class EncounterDiagnosis extends TenantAwareEntity {

    @Column(name = "encounter_id", nullable = false)
    private Long encounterId;

    @Column(name = "icd10_code", nullable = false, length = 20)
    private String icd10Code;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary = false;

    /** Display order when multiple diagnoses appear on the encounter. */
    @Column(name = "sequence")
    private Integer sequence;
}
