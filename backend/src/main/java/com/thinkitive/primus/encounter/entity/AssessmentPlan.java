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
@Table(name = "assessment_plans")
public class AssessmentPlan extends TenantAwareEntity {

    @Column(name = "encounter_id", nullable = false)
    private Long encounterId;

    @Column(name = "diagnosis", nullable = false, length = 500)
    private String diagnosis;

    @Column(name = "icd_code", nullable = false, length = 20)
    private String icdCode;

    @Column(name = "plan", columnDefinition = "TEXT")
    private String plan;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;
}
