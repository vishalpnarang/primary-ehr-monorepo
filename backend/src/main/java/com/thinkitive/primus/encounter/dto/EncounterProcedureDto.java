package com.thinkitive.primus.encounter.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class EncounterProcedureDto {

    private String uuid;
    private String encounterUuid;
    private String cptCode;
    private String description;
    private String modifier;
    private Integer units;
    private Instant createdAt;
    private Instant modifiedAt;
}
