package com.thinkitive.primus.patient.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AllergyRequest {

    @NotBlank private String allergen;
    @NotBlank private String reaction;
    private String severity;   // MILD | MODERATE | SEVERE | LIFE_THREATENING
    private String onsetDate;
    private String notes;
}
