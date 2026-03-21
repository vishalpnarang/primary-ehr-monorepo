package com.thinkitive.primus.billing.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class PatientBalanceDto {

    private UUID patientUuid;
    private String patientName;
    private BigDecimal currentBalance;
    private BigDecimal overdueBalance;
    private int overduedays;
}
