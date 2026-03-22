package com.thinkitive.primus.prescription.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
public class DrugIntoleranceDto {

    private String uuid;
    private Long patientId;
    private String drugName;
    private String rxnormCode;
    private String reaction;
    private String severity;
    private LocalDate onsetDate;
    private Instant createdAt;
    private Instant modifiedAt;
}
