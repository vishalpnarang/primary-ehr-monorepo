package com.thinkitive.primus.encounter.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class AddendumDto {

    private String uuid;
    private String encounterUuid;
    private String text;
    private String addedBy;
    private Instant addedAt;
}
