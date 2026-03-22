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
@Table(name = "encounter_procedures")
public class EncounterProcedure extends TenantAwareEntity {

    @Column(name = "encounter_id", nullable = false)
    private Long encounterId;

    @Column(name = "cpt_code", nullable = false, length = 20)
    private String cptCode;

    @Column(name = "description", length = 500)
    private String description;

    /** Optional billing modifier (e.g., 25, 59, GT). */
    @Column(name = "modifier", length = 10)
    private String modifier;

    @Column(name = "units", nullable = false)
    private Integer units = 1;
}
