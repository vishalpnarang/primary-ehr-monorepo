package com.thinkitive.primus.prescription.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class InteractionCheckRequest {

    @NotNull  private UUID patientUuid;
    @NotNull  private List<String> ndcCodes; // codes to check (including new drug)
}
