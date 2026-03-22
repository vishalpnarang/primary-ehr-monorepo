package com.thinkitive.primus.scheduling.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentTypeRequest {

    @NotBlank(message = "Appointment type name is required")
    private String name;

    @Min(value = 5, message = "Duration must be at least 5 minutes")
    private int durationMinutes = 30;

    /** Hex color, e.g. "#3B82F6" */
    private String color;

    private String description;
    private boolean allowOnlineBooking;
}
