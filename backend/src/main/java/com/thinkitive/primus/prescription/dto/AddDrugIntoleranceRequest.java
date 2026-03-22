package com.thinkitive.primus.prescription.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AddDrugIntoleranceRequest {

    @NotBlank
    private String drugName;

    private String rxnormCode;
    private String reaction;
    private String severity;
    private LocalDate onsetDate;
}
