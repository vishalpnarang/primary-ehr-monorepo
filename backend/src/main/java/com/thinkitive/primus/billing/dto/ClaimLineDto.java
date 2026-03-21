package com.thinkitive.primus.billing.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ClaimLineDto {

    private String cptCode;
    private String modifier;
    private String icd10Code;
    private int units;
    private BigDecimal unitCharge;
    private BigDecimal totalCharge;
}
