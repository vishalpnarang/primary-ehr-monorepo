package com.thinkitive.primus.scheduling.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class CreateAppointmentRequest {

    @NotNull  private UUID patientUuid;
    @NotBlank private String providerId;
    @NotNull  private Instant startTime;
    @NotNull  private Instant endTime;
    @NotBlank private String appointmentType; // OFFICE_VISIT | TELEHEALTH | FOLLOW_UP | WELLNESS
    private String locationId;
    private String chiefComplaint;
    private String notes;
}
