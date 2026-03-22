package com.thinkitive.primus.patient.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PastMedicalHistoryRequest {

    @NotBlank(message = "Condition is required")
    private String condition;

    private String icd10Code;
    private LocalDate onsetDate;
    private LocalDate resolutionDate;

    /** Accepted values: ACTIVE, RESOLVED, CHRONIC */
    private String status;
    private String notes;
}
