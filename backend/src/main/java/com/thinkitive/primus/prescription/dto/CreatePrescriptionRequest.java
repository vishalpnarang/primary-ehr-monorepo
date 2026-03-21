package com.thinkitive.primus.prescription.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;


@Data
public class CreatePrescriptionRequest {

    @NotNull  private String patientUuid;
    @NotNull  private String encounterUuid;
    @NotBlank private String drugName;
    private String ndcCode;
    @NotBlank private String strength;
    @NotBlank private String dosageForm;    // TABLET | CAPSULE | LIQUID | etc.
    @NotBlank private String route;         // ORAL | TOPICAL | IV | etc.
    @NotBlank private String sig;           // "Take 1 tablet by mouth once daily"
    @NotNull  private Integer quantity;
    @NotBlank private String unit;          // TABLETS | ML | etc.
    private Integer refills;
    private boolean daw;                    // Dispense As Written
    private String diagnosisCode;           // ICD-10
    private String pharmacyId;
    private String notes;
    private boolean controlled;
    private String deaSchedule;             // II | III | IV | V (if controlled)
}
