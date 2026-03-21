package com.thinkitive.primus.prescription.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class InteractionCheckRequest {

    @NotNull  private String patientUuid;
    @NotNull  private List<String> ndcCodes; // codes to check (including new drug)
}
