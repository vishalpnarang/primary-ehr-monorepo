package com.thinkitive.primus.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RecordTransactionRequest {

    @NotNull
    private Long itemId;

    @NotBlank
    private String transactionType;

    @NotNull
    private Integer quantity;

    private String referenceNumber;
    private String notes;
    private String performedBy;
}
