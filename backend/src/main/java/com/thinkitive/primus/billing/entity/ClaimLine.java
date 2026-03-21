package com.thinkitive.primus.billing.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "claim_lines")
public class ClaimLine extends TenantAwareEntity {

    @Column(name = "claim_id", nullable = false)
    private Long claimId;

    @Column(name = "cpt_code", nullable = false, length = 10)
    private String cptCode;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "modifier", length = 10)
    private String modifier;

    @Column(name = "units", nullable = false)
    private Integer units = 1;

    @Column(name = "charge", nullable = false, precision = 10, scale = 2)
    private BigDecimal charge;
}
