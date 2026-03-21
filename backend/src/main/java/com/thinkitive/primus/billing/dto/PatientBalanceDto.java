package com.thinkitive.primus.billing.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PatientBalanceDto {

    private String patientUuid;
    private String patientName;
    private BigDecimal currentBalance;
    private BigDecimal overdueBalance;
    private int overduedays;
}
