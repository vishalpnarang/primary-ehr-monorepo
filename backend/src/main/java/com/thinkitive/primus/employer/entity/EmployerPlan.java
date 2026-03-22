package com.thinkitive.primus.employer.entity;

import com.thinkitive.primus.shared.entity.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "employer_plans")
public class EmployerPlan extends TenantAwareEntity {

    @Column(name = "employer_id", nullable = false)
    private Long employerId;

    @Column(name = "plan_name", nullable = false, length = 255)
    private String planName;

    @Column(name = "discount_percent", precision = 5, scale = 2)
    private BigDecimal discountPercent = BigDecimal.ZERO;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;
}
