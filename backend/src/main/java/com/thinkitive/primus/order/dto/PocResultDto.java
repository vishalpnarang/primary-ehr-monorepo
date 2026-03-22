package com.thinkitive.primus.order.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class PocResultDto {

    private String uuid;
    private String pocTestUuid;
    private Long patientId;
    private Long encounterId;
    private String results;
    private String performedBy;
    private Instant performedAt;
    private Instant createdAt;
    private Instant modifiedAt;
}
