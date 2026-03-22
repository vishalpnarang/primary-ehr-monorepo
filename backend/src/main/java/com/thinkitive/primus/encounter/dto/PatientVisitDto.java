package com.thinkitive.primus.encounter.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class PatientVisitDto {

    private String uuid;
    private String patientUuid;
    private String encounterUuid;
    private String appointmentUuid;
    private Instant checkInTime;
    private Instant roomingTime;
    private Instant providerStartTime;
    private Instant checkoutTime;
    private String status;
    private Instant createdAt;
    private Instant modifiedAt;
}
