package com.thinkitive.primus.patient.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class AllergyDto {

    private UUID uuid;
    private UUID patientUuid;
    private String allergen;
    private String reaction;
    private String severity;
    private String onsetDate;
    private String notes;
    private String recordedBy;
    private Instant recordedAt;
}
