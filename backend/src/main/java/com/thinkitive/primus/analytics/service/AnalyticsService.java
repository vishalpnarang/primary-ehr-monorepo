package com.thinkitive.primus.analytics.service;

import com.thinkitive.primus.analytics.dto.*;

import java.util.List;
import java.util.Map;

public interface AnalyticsService {

    List<DashboardDefinitionDto> getDashboards();

    DashboardDefinitionDto createDashboard(CreateDashboardRequest request);

    List<SavedReportDto> getReports();

    SavedReportDto createReport(CreateReportRequest request);

    /** Execute a saved report by UUID. Returns rows as list of column→value maps. */
    List<Map<String, Object>> runReport(String reportUuid);

    PatientVolumeStatsDto getPatientVolumeStats();

    AppointmentUtilizationDto getAppointmentUtilization();

    RevenueBreakdownDto getRevenueBreakdown();
}
