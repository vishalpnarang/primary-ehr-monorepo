package com.thinkitive.primus.affiliate.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class BrokerDto {

    private String uuid;
    private String name;
    private String firmName;
    private String email;
    private String phone;
    private String licenseNumber;
    private BigDecimal commissionRate;
    private String status;
    private Instant createdAt;
    private Instant modifiedAt;
}
