package com.thinkitive.primus.analytics.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardDto {

    private int totalActivePatients;
    private int totalActiveProviders;
    private int appointmentsThisMonth;
    private int newPatientsThisMonth;
    private int openLocations;
    private double avgPatientSatisfaction;
    private double providerUtilizationRate;
    private long totalEncountersThisMonth;
}
