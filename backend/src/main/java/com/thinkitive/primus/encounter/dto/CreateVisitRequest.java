package com.thinkitive.primus.encounter.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.Instant;

@Data
public class CreateVisitRequest {

    @NotBlank
    private String patientUuid;

    private String appointmentUuid;

    private Instant checkInTime;
}
