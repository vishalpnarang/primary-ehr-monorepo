package com.thinkitive.primus.patient.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TimelineEventDto {

    private String uuid;
    private String eventType;  // ENCOUNTER | ORDER | RESULT | PRESCRIPTION | VITALS | ALLERGY | PROBLEM
    private String title;
    private String summary;
    private Instant occurredAt;
    private String providerId;
    private String providerName;
    private String referenceUuid;
}
