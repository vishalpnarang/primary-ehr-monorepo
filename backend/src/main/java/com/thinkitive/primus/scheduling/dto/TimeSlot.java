package com.thinkitive.primus.scheduling.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TimeSlot {

    private Instant startTime;
    private Instant endTime;
    private int durationMinutes;
    private boolean available;
}
