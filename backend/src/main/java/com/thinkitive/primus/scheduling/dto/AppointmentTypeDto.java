package com.thinkitive.primus.scheduling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentTypeDto {

    private Long id;
    private String name;
    private int durationMinutes;
    private String color;
    private String description;
    private boolean allowOnlineBooking;
    private Instant createdAt;
    private Instant modifiedAt;
}
