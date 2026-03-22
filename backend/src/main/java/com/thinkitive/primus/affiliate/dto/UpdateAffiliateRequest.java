package com.thinkitive.primus.affiliate.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateAffiliateRequest {

    private String name;
    private String contactName;
    private String email;
    private String phone;
    private BigDecimal commissionRate;
    private String status;
}
