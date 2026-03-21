package com.thinkitive.primus.billing.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ArAgingDto {

    private BigDecimal current;       // 0-30 days
    private BigDecimal days31to60;
    private BigDecimal days61to90;
    private BigDecimal days91to120;
    private BigDecimal over120;
    private BigDecimal total;
}
