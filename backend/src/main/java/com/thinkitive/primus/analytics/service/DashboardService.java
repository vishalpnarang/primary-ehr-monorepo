package com.thinkitive.primus.analytics.service;

import com.thinkitive.primus.analytics.dto.*;

public interface DashboardService {

    ProviderDashboardDto getProviderDashboard(String providerId);

    NurseDashboardDto getNurseDashboard();

    FrontDeskDashboardDto getFrontDeskDashboard();

    BillingDashboardDto getBillingDashboard();

    AdminDashboardDto getAdminDashboard();
}
