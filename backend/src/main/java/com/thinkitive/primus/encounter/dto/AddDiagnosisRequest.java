package com.thinkitive.primus.encounter.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AddDiagnosisRequest {

    @NotBlank
    @Size(max = 20)
    private String icd10Code;

    @Size(max = 500)
    private String description;

    private boolean isPrimary = false;

    private Integer sequence;
}
