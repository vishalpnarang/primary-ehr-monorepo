package com.thinkitive.primus.analytics.service;

import com.thinkitive.primus.analytics.dto.*;
import com.thinkitive.primus.analytics.entity.DashboardDefinition;
import com.thinkitive.primus.analytics.entity.SavedReport;
import com.thinkitive.primus.analytics.repository.DashboardDefinitionRepository;
import com.thinkitive.primus.analytics.repository.SavedReportRepository;
import com.thinkitive.primus.billing.entity.Claim;
import com.thinkitive.primus.billing.repository.ClaimRepository;
import com.thinkitive.primus.patient.entity.Patient;
import com.thinkitive.primus.patient.repository.PatientRepository;
import com.thinkitive.primus.scheduling.entity.Appointment;
import com.thinkitive.primus.scheduling.repository.AppointmentRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {

    private final DashboardDefinitionRepository dashboardRepository;
    private final SavedReportRepository         reportRepository;
    private final PatientRepository             patientRepository;
    private final AppointmentRepository         appointmentRepository;
    private final ClaimRepository               claimRepository;
    private final EntityManager                 entityManager;

    // ── Dashboards ────────────────────────────────────────────────────────────

    @Override
    public List<DashboardDefinitionDto> getDashboards() {
        Long tenantId = TenantContext.getTenantId();
        return dashboardRepository
                .findByTenantIdAndIsActiveTrueAndArchiveFalseOrderByDisplayOrderAsc(tenantId)
                .stream()
                .map(this::toDashboardDto)
                .toList();
    }

    @Override
    @Transactional
    public DashboardDefinitionDto createDashboard(CreateDashboardRequest request) {
        Long tenantId = TenantContext.getTenantId();
        DashboardDefinition.DashboardCategory category = parseCategory(request.getCategory());

        DashboardDefinition def = DashboardDefinition.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .description(request.getDescription())
                .category(category)
                .queryConfig(request.getQueryConfig())
                .chartType(request.getChartType())
                .displayOrder(request.getDisplayOrder())
                .isActive(true)
                .rolesAllowed(request.getRolesAllowed())
                .build();

        DashboardDefinition saved = dashboardRepository.save(def);
        log.info("Dashboard created name={} tenantId={}", request.getName(), tenantId);
        return toDashboardDto(saved);
    }

    // ── Reports ───────────────────────────────────────────────────────────────

    @Override
    public List<SavedReportDto> getReports() {
        Long tenantId = TenantContext.getTenantId();
        String userId  = currentUserIdStr();

        // Return all reports accessible to this user (owned + shared)
        List<SavedReport> owned  = reportRepository.findByTenantIdAndCreatedByUserAndArchiveFalse(tenantId, userId);
        List<SavedReport> shared = reportRepository.findByTenantIdAndIsSharedTrueAndArchiveFalse(tenantId);

        return shared.stream()
                .filter(r -> !owned.contains(r))
                .map(this::toReportDto)
                .toList();
    }

    @Override
    @Transactional
    public SavedReportDto createReport(CreateReportRequest request) {
        Long tenantId = TenantContext.getTenantId();
        String userId  = currentUserIdStr();

        SavedReport report = SavedReport.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .querySql(request.getQuerySql())
                .parameters(request.getParameters())
                .createdByUser(userId)
                .isShared(request.isShared())
                .build();

        SavedReport saved = reportRepository.save(report);
        log.info("Saved report created name={} tenantId={}", request.getName(), tenantId);
        return toReportDto(saved);
    }

    @Override
    @Transactional
    public List<Map<String, Object>> runReport(String reportUuid) {
        Long tenantId = TenantContext.getTenantId();
        SavedReport report = reportRepository.findByTenantIdAndUuid(tenantId, reportUuid)
                .filter(r -> !r.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Report not found: " + reportUuid));

        try {
            log.info("Running report uuid={} name={} tenantId={}", reportUuid, report.getName(), tenantId);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> results = entityManager
                    .createNativeQuery(report.getQuerySql(), Map.class)
                    .setParameter("tenantId", tenantId)
                    .getResultList();

            // Update last_run_at
            report.setLastRunAt(Instant.now());
            reportRepository.save(report);

            return results;
        } catch (Exception e) {
            log.error("Report execution failed uuid={} error={}", reportUuid, e.getMessage());
            throw new PrimusException(ResponseCode.BAD_REQUEST,
                    "Report execution failed: " + e.getMessage());
        }
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    @Override
    public PatientVolumeStatsDto getPatientVolumeStats() {
        Long tenantId = TenantContext.getTenantId();

        // Use available repository methods
        long totalPatients  = patientRepository.findByTenantIdAndArchiveFalse(
                tenantId, PageRequest.of(0, 1)).getTotalElements();
        long activePatients = patientRepository.countByTenantIdAndStatus(
                tenantId, Patient.PatientStatus.ACTIVE);

        return PatientVolumeStatsDto.builder()
                .totalPatients(totalPatients)
                .activePatients(activePatients)
                .newPatientsThisMonth(0L)
                .newPatientsThisWeek(0L)
                .averageAgeMale(0.0)
                .averageAgeFemale(0.0)
                .build();
    }

    @Override
    public AppointmentUtilizationDto getAppointmentUtilization() {
        Long tenantId = TenantContext.getTenantId();

        // Aggregate via filter query using null parameters for totals
        long totalScheduled = appointmentRepository
                .filterAppointments(tenantId, null, null, null, PageRequest.of(0, 1))
                .getTotalElements();

        long totalCompleted = appointmentRepository
                .filterAppointments(tenantId, null, Appointment.AppointmentStatus.COMPLETED, null, PageRequest.of(0, 1))
                .getTotalElements();

        long totalCancelled = appointmentRepository
                .filterAppointments(tenantId, null, Appointment.AppointmentStatus.CANCELLED, null, PageRequest.of(0, 1))
                .getTotalElements();

        long totalNoShow = appointmentRepository
                .filterAppointments(tenantId, null, Appointment.AppointmentStatus.NO_SHOW, null, PageRequest.of(0, 1))
                .getTotalElements();

        double utilizationRate = totalScheduled > 0
                ? Math.round((double) totalCompleted / totalScheduled * 1000.0) / 10.0
                : 0.0;

        return AppointmentUtilizationDto.builder()
                .totalScheduled(totalScheduled)
                .totalCompleted(totalCompleted)
                .totalCancelled(totalCancelled)
                .totalNoShow(totalNoShow)
                .utilizationRate(utilizationRate)
                .scheduledToday(0L)
                .scheduledThisWeek(0L)
                .build();
    }

    @Override
    public RevenueBreakdownDto getRevenueBreakdown() {
        Long tenantId = TenantContext.getTenantId();

        // Use pageable count queries to avoid loading all entities
        long totalClaims   = claimRepository.findByTenantId(tenantId, PageRequest.of(0, 1)).getTotalElements();
        long deniedClaims  = claimRepository.findByTenantIdAndStatus(
                tenantId, Claim.ClaimStatus.DENIED, PageRequest.of(0, 1)).getTotalElements();
        long pendingClaims = claimRepository.findByTenantIdAndStatus(
                tenantId, Claim.ClaimStatus.SUBMITTED, PageRequest.of(0, 1)).getTotalElements();

        return RevenueBreakdownDto.builder()
                .totalBilled(BigDecimal.ZERO)
                .totalCollected(BigDecimal.ZERO)
                .totalOutstanding(BigDecimal.ZERO)
                .totalWriteOff(BigDecimal.ZERO)
                .totalClaims(totalClaims)
                .pendingClaims(pendingClaims)
                .deniedClaims(deniedClaims)
                .collectionRate(0.0)
                .build();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private DashboardDefinitionDto toDashboardDto(DashboardDefinition d) {
        return DashboardDefinitionDto.builder()
                .uuid(d.getUuid())
                .name(d.getName())
                .description(d.getDescription())
                .category(d.getCategory() != null ? d.getCategory().name() : null)
                .queryConfig(d.getQueryConfig())
                .chartType(d.getChartType())
                .displayOrder(d.getDisplayOrder())
                .active(d.isActive())
                .rolesAllowed(d.getRolesAllowed())
                .createdAt(d.getCreatedAt())
                .modifiedAt(d.getModifiedAt())
                .build();
    }

    private SavedReportDto toReportDto(SavedReport r) {
        return SavedReportDto.builder()
                .uuid(r.getUuid())
                .name(r.getName())
                .description(r.getDescription())
                .category(r.getCategory())
                .querySql(r.getQuerySql())
                .parameters(r.getParameters())
                .createdByUser(r.getCreatedByUser())
                .shared(r.isShared())
                .lastRunAt(r.getLastRunAt())
                .createdAt(r.getCreatedAt())
                .modifiedAt(r.getModifiedAt())
                .build();
    }

    private DashboardDefinition.DashboardCategory parseCategory(String raw) {
        if (raw == null) return DashboardDefinition.DashboardCategory.OPERATIONAL;
        try {
            return DashboardDefinition.DashboardCategory.valueOf(raw.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown dashboard category '{}', defaulting to OPERATIONAL", raw);
            return DashboardDefinition.DashboardCategory.OPERATIONAL;
        }
    }

    private String currentUserIdStr() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            Object userIdClaim = jwt.getClaims().get("user_id");
            if (userIdClaim != null) return userIdClaim.toString();
            String sub = jwt.getSubject();
            if (sub != null) return sub;
        }
        return "0";
    }
}
