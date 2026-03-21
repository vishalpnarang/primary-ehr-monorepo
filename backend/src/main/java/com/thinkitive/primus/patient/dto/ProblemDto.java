package com.thinkitive.primus.patient.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ProblemDto {

    private String uuid;
    private String patientUuid;
    private String icd10Code;
    private String description;
    private String status;
    private String onsetDate;
    private String notes;
    private String recordedBy;
    private Instant recordedAt;
}
