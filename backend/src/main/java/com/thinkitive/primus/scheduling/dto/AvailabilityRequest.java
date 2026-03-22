package com.thinkitive.primus.scheduling.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityRequest {

    @NotBlank(message = "Provider ID is required")
    private String providerId;

    /** 0 = Sunday, 1 = Monday, ..., 6 = Saturday */
    @NotNull(message = "Day of week is required")
    private Integer dayOfWeek;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private Long locationId;
    private Long appointmentTypeId;
    private boolean isActive = true;
}
