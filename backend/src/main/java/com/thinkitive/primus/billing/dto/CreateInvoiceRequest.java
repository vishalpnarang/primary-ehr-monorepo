package com.thinkitive.primus.billing.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreateInvoiceRequest {

    @NotNull
    private Long patientId;

    private Long encounterId;
    private LocalDate dueDate;
    private List<AddLineItemRequest> lineItems;
}
