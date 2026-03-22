package com.thinkitive.primus.affiliate.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateAffiliateRequest {

    @NotBlank(message = "Affiliate name is required")
    private String name;

    private String contactName;
    private String email;
    private String phone;
    private BigDecimal commissionRate = BigDecimal.ZERO;
}
