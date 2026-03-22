package com.thinkitive.primus.patient.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FamilyHistoryRequest {

    @NotBlank(message = "Relationship is required")
    private String relationship;

    @NotBlank(message = "Condition is required")
    private String condition;

    private String icd10Code;
    private Integer onsetAge;
    private boolean deceased;
    private String notes;
}
