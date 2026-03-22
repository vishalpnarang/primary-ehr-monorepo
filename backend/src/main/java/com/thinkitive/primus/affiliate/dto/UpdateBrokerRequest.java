package com.thinkitive.primus.affiliate.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateBrokerRequest {

    private String name;
    private String firmName;
    private String email;
    private String phone;
    private String licenseNumber;
    private BigDecimal commissionRate;
    private String status;
}
