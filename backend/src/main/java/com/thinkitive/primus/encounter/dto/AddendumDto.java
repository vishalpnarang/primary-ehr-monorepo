package com.thinkitive.primus.encounter.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class AddendumDto {

    private UUID uuid;
    private UUID encounterUuid;
    private String text;
    private String addedBy;
    private Instant addedAt;
}
