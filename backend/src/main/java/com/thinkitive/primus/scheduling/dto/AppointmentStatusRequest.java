package com.thinkitive.primus.scheduling.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AppointmentStatusRequest {

    @NotBlank
    private String status; // CONFIRMED | CHECKED_IN | ROOMED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW
    private String notes;
}
