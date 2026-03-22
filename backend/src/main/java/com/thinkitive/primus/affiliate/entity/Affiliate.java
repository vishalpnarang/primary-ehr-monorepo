package com.thinkitive.primus.affiliate.entity;

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
@Table(name = "affiliates")
public class Affiliate extends TenantAwareEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "contact_name", length = 255)
    private String contactName;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "commission_rate", precision = 5, scale = 2)
    private BigDecimal commissionRate = BigDecimal.ZERO;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";
}
