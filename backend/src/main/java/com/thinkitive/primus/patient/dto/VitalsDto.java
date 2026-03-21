package com.thinkitive.primus.patient.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class VitalsDto {

    private UUID uuid;
    private UUID patientUuid;
    private Instant recordedAt;
    private Double weightLbs;
    private Double heightInches;
    private Double bmiCalculated;
    private String bloodPressure;
    private Integer heartRateBpm;
    private Integer respiratoryRateBpm;
    private Double temperatureFahrenheit;
    private Double oxygenSaturationPercent;
    private Double bloodGlucoseMgDl;
    private String glucoseTiming;
    private String notes;
    private String recordedBy;
}
