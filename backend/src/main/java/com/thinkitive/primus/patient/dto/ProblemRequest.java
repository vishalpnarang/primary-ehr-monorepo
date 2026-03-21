package com.thinkitive.primus.patient.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProblemRequest {

    @NotBlank private String icd10Code;
    @NotBlank private String description;
    private String status;     // ACTIVE | RESOLVED | CHRONIC | INACTIVE
    private String onsetDate;
    private String notes;
}
