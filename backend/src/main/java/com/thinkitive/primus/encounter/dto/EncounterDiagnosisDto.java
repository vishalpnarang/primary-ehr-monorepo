package com.thinkitive.primus.encounter.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class EncounterDiagnosisDto {

    private String uuid;
    private String encounterUuid;
    private String icd10Code;
    private String description;
    private boolean isPrimary;
    private Integer sequence;
    private Instant createdAt;
    private Instant modifiedAt;
}
