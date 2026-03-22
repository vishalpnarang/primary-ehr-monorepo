package com.thinkitive.primus.employer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AddEmployerPlanRequest {

    @NotBlank(message = "Plan name is required")
    private String planName;

    private BigDecimal discountPercent = BigDecimal.ZERO;

    @NotNull(message = "Effective date is required")
    private LocalDate effectiveDate;
}
