package com.thinkitive.primus.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class LabOrderRequest {

    @NotNull  private String patientUuid;
    @NotNull  private String encounterUuid;
    @NotBlank private String lab;          // QUEST | LABCORP | IN_HOUSE
    @NotNull  private List<String> tests;  // LOINC codes
    private String icd10Code;
    private String priority;              // ROUTINE | URGENT | STAT
    private String notes;
    private boolean fasting;
}
