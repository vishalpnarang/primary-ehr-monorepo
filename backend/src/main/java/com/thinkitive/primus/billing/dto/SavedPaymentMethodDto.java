package com.thinkitive.primus.billing.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class SavedPaymentMethodDto {

    private String uuid;
    private Long patientId;
    private String methodType;
    private String lastFour;
    private String brand;
    private Integer expMonth;
    private Integer expYear;
    private boolean isDefault;
    private Instant createdAt;
    private Instant modifiedAt;
}
