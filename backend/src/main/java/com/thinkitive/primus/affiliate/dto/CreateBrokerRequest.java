package com.thinkitive.primus.affiliate.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateBrokerRequest {

    @NotBlank(message = "Broker name is required")
    private String name;

    private String firmName;
    private String email;
    private String phone;
    private String licenseNumber;
    private BigDecimal commissionRate = BigDecimal.ZERO;
}
