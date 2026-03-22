package com.thinkitive.primus.analytics.service;

import com.thinkitive.primus.analytics.dto.CreateDashboardRequest;
import com.thinkitive.primus.analytics.dto.CreateReportRequest;
import com.thinkitive.primus.analytics.dto.DashboardDefinitionDto;
import com.thinkitive.primus.analytics.dto.SavedReportDto;
import com.thinkitive.primus.analytics.entity.DashboardDefinition;
import com.thinkitive.primus.analytics.entity.SavedReport;
import com.thinkitive.primus.analytics.repository.DashboardDefinitionRepository;
import com.thinkitive.primus.analytics.repository.SavedReportRepository;
import com.thinkitive.primus.billing.repository.ClaimRepository;
import com.thinkitive.primus.patient.repository.PatientRepository;
import com.thinkitive.primus.scheduling.repository.AppointmentRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock DashboardDefinitionRepository dashboardRepository;
    @Mock SavedReportRepository         reportRepository;
    @Mock PatientRepository             patientRepository;
    @Mock AppointmentRepository         appointmentRepository;
    @Mock ClaimRepository               claimRepository;
    @Mock EntityManager                 entityManager;

    @InjectMocks
    AnalyticsServiceImpl analyticsService;

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(1L);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("createDashboard persists dashboard and returns DTO with correct category")
    void createDashboard_persistsAndReturnsDto() {
        CreateDashboardRequest request = new CreateDashboardRequest();
        request.setName("Revenue Overview");
        request.setDescription("Monthly revenue breakdown by payer");
        request.setCategory("FINANCIAL");
        request.setChartType("BAR");
        request.setDisplayOrder(1);

        DashboardDefinition saved = DashboardDefinition.builder()
                .tenantId(1L)
                .name("Revenue Overview")
                .description("Monthly revenue breakdown by payer")
                .category(DashboardDefinition.DashboardCategory.FINANCIAL)
                .chartType("BAR")
                .displayOrder(1)
                .isActive(true)
                .build();
        saved.setId(1L);
        saved.setUuid(UUID.randomUUID().toString());

        when(dashboardRepository.save(any(DashboardDefinition.class))).thenReturn(saved);

        DashboardDefinitionDto result = analyticsService.createDashboard(request);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Revenue Overview");
        assertThat(result.getCategory()).isEqualTo("FINANCIAL");
        assertThat(result.getChartType()).isEqualTo("BAR");
        assertThat(result.isActive()).isTrue();
        verify(dashboardRepository).save(any(DashboardDefinition.class));
    }

    @Test
    @DisplayName("createDashboard defaults to OPERATIONAL category when category is null")
    void createDashboard_defaultsToOperationalCategory() {
        CreateDashboardRequest request = new CreateDashboardRequest();
        request.setName("Daily Appointments");
        request.setDisplayOrder(2);
        // category intentionally null — should default to OPERATIONAL

        DashboardDefinition saved = DashboardDefinition.builder()
                .tenantId(1L)
                .name("Daily Appointments")
                .category(DashboardDefinition.DashboardCategory.OPERATIONAL)
                .isActive(true)
                .build();
        saved.setId(2L);
        saved.setUuid(UUID.randomUUID().toString());

        when(dashboardRepository.save(any(DashboardDefinition.class))).thenReturn(saved);

        DashboardDefinitionDto result = analyticsService.createDashboard(request);

        assertThat(result.getCategory()).isEqualTo("OPERATIONAL");
    }

    @Test
    @DisplayName("createReport persists saved report linked to current user")
    void createReport_persistsAndReturnsDto() {
        CreateReportRequest request = new CreateReportRequest();
        request.setName("Monthly New Patients");
        request.setDescription("Count of new patients registered per month");
        request.setCategory("PATIENT_VOLUME");
        request.setQuerySql("SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*) FROM patients WHERE tenant_id = :tenantId GROUP BY 1");
        request.setShared(true);

        SavedReport saved = SavedReport.builder()
                .tenantId(1L)
                .name("Monthly New Patients")
                .description("Count of new patients registered per month")
                .category("PATIENT_VOLUME")
                .querySql(request.getQuerySql())
                .createdByUser("0")
                .isShared(true)
                .build();
        saved.setId(1L);
        saved.setUuid(UUID.randomUUID().toString());

        when(reportRepository.save(any(SavedReport.class))).thenReturn(saved);

        SavedReportDto result = analyticsService.createReport(request);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Monthly New Patients");
        assertThat(result.isShared()).isTrue();
        assertThat(result.getQuerySql()).isNotBlank();
        verify(reportRepository).save(any(SavedReport.class));
    }
}
