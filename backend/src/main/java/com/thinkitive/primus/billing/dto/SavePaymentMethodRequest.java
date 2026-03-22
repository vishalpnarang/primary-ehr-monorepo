package com.thinkitive.primus.billing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SavePaymentMethodRequest {

    @NotNull
    private Long patientId;

    @NotBlank
    private String methodType;

    private String lastFour;
    private String brand;
    private Integer expMonth;
    private Integer expYear;
    private boolean isDefault = false;
    private String stripePaymentMethodId;
}
