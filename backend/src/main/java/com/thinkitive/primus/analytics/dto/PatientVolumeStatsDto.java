package com.thinkitive.primus.analytics.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PatientVolumeStatsDto {

    private long totalPatients;
    private long activePatients;
    private long newPatientsThisMonth;
    private long newPatientsThisWeek;
    private double averageAgeMale;
    private double averageAgeFemale;
}
