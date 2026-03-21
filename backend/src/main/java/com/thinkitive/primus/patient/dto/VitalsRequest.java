package com.thinkitive.primus.patient.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class VitalsRequest {

    @NotNull private Instant recordedAt;

    private Double weightLbs;
    private Double heightInches;
    private Double bmiCalculated;

    private String bloodPressureSystolic;
    private String bloodPressureDiastolic;

    private Integer heartRateBpm;
    private Integer respiratoryRateBpm;
    private Double temperatureFahrenheit;
    private Double oxygenSaturationPercent;

    private Double bloodGlucoseMgDl;
    private String glucoseTiming;   // FASTING | POST_MEAL | RANDOM

    private String notes;
}
