package com.thinkitive.primus.affiliate.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class AffiliateDto {

    private String uuid;
    private String name;
    private String contactName;
    private String email;
    private String phone;
    private BigDecimal commissionRate;
    private String status;
    private Instant createdAt;
    private Instant modifiedAt;
}
