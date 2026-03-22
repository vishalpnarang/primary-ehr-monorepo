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
@Table(name = "family_history")
public class FamilyHistory extends TenantAwareEntity {

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "relationship", nullable = false, length = 50)
    private String relationship;

    @Column(name = "condition", nullable = false, length = 255)
    private String condition;

    @Column(name = "icd10_code", length = 20)
    private String icd10Code;

    @Column(name = "onset_age")
    private Integer onsetAge;

    @Column(name = "deceased")
    private boolean deceased = false;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
