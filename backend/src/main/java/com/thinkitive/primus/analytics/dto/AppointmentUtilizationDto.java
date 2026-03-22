package com.thinkitive.primus.analytics.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AppointmentUtilizationDto {

    private long totalScheduled;
    private long totalCompleted;
    private long totalCancelled;
    private long totalNoShow;
    private double utilizationRate;
    private long scheduledToday;
    private long scheduledThisWeek;
}
