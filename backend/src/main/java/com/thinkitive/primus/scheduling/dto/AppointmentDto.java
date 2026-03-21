package com.thinkitive.primus.scheduling.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class AppointmentDto {

    private String uuid;
    private String patientUuid;
    private String patientName;
    private String patientMrn;
    private String providerId;
    private String providerName;
    private Instant startTime;
    private Instant endTime;
    private String appointmentType;
    private String status; // SCHEDULED | CONFIRMED | CHECKED_IN | ROOMED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW
    private String locationId;
    private String chiefComplaint;
    private String notes;
    private Instant createdAt;
}
