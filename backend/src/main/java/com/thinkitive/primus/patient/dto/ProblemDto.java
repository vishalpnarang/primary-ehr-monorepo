package com.thinkitive.primus.patient.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class ProblemDto {

    private UUID uuid;
    private UUID patientUuid;
    private String icd10Code;
    private String description;
    private String status;
    private String onsetDate;
    private String notes;
    private String recordedBy;
    private Instant recordedAt;
}
