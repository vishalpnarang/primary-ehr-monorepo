package com.thinkitive.primus.billing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AddLineItemRequest {

    @NotBlank
    private String description;

    private String cptCode;
    private String icdCodes;
    private Integer quantity = 1;

    @NotNull
    private BigDecimal unitPrice;
}
