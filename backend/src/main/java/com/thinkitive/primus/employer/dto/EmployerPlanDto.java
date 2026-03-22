package com.thinkitive.primus.employer.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
public class EmployerPlanDto {

    private String uuid;
    private Long employerId;
    private String planName;
    private BigDecimal discountPercent;
    private LocalDate effectiveDate;
    private Instant createdAt;
}
