package com.thinkitive.primus.scheduling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderAvailabilityDto {

    private Long id;
    private String providerId;

    /** 0 = Sunday, 1 = Monday, ..., 6 = Saturday */
    private int dayOfWeek;

    private LocalTime startTime;
    private LocalTime endTime;
    private Long locationId;
    private Long appointmentTypeId;
    private boolean isActive;
    private Instant createdAt;
    private Instant modifiedAt;
}
