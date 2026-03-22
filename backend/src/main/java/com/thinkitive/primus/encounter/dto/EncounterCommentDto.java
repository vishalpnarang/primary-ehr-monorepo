package com.thinkitive.primus.encounter.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class EncounterCommentDto {

    private String uuid;
    private String encounterUuid;
    private String userId;
    private String comment;
    private Instant createdAt;
    private Instant modifiedAt;
}
