package com.thinkitive.primus.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class LabOrderRequest {

    @NotNull  private UUID patientUuid;
    @NotNull  private UUID encounterUuid;
    @NotBlank private String lab;          // QUEST | LABCORP | IN_HOUSE
    @NotNull  private List<String> tests;  // LOINC codes
    private String icd10Code;
    private String priority;              // ROUTINE | URGENT | STAT
    private String notes;
    private boolean fasting;
}
