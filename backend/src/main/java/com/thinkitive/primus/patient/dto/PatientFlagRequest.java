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
public class PatientFlagRequest {

    /** Accepted values: HIGH_RISK, FALL_RISK, DNR, CARE_GAP, OUTSTANDING_BALANCE */
    @NotBlank(message = "Flag type is required")
    private String flagType;

    @NotBlank(message = "Label is required")
    private String label;

    /** Accepted values: LOW, MEDIUM, HIGH, CRITICAL */
    private String severity;

    private String notes;
}
