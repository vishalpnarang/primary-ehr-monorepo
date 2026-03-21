package com.thinkitive.primus.analytics.service;

import com.thinkitive.primus.analytics.dto.*;
import com.thinkitive.primus.shared.config.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Phase-0 stub — returns realistic mock KPIs.
 * Phase 9: replace with aggregation queries against encounter, billing, scheduling tables.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    @Override
    public ProviderDashboardDto getProviderDashboard(String providerId) {
        Long tenantId = TenantContext.getTenantId();
        return ProviderDashboardDto.builder()
                .todayAppointmentsTotal(14)
                .todayAppointmentsCompleted(6)
                .todayAppointmentsPending(8)
                .inboxItemsUnread(5)
                .pendingSignatures(3)
                .labResultsPending(7)
                .refillRequestsPending(4)
                .upcomingAppointments(List.of(
                        ProviderDashboardDto.AppointmentSummary.builder()
                                .patientName("James Anderson")
                                .time("10:00 AM")
                                .type("Office Visit")
                                .status("CHECKED_IN")
                                .chiefComplaint("Annual physical")
                                .build(),
                        ProviderDashboardDto.AppointmentSummary.builder()
                                .patientName("Maria Gonzalez")
                                .time("10:20 AM")
                                .type("Follow Up")
                                .status("SCHEDULED")
                                .chiefComplaint("Hypertension management")
                                .build(),
                        ProviderDashboardDto.AppointmentSummary.builder()
                                .patientName("Robert Chen")
                                .time("10:40 AM")
                                .type("Telehealth")
                                .status("SCHEDULED")
                                .chiefComplaint("Medication review")
                                .build()
                ))
                .build();
    }

    @Override
    public NurseDashboardDto getNurseDashboard() {
        return NurseDashboardDto.builder()
                .patientsToRoom(3)
                .vitalsNeeded(3)
                .medicationTasksPending(1)
                .roomingQueue(List.of(
                        NurseDashboardDto.RoomingTask.builder()
                                .patientName("James Anderson")
                                .mrn("PAT-10001")
                                .checkedInAt("9:55 AM")
                                .appointmentType("Office Visit")
                                .assignedRoom("Room 3")
                                .status("WAITING")
                                .build(),
                        NurseDashboardDto.RoomingTask.builder()
                                .patientName("Maria Gonzalez")
                                .mrn("PAT-10023")
                                .checkedInAt("10:12 AM")
                                .appointmentType("Follow Up")
                                .assignedRoom("Room 1")
                                .status("ROOMING")
                                .build()
                ))
                .build();
    }

    @Override
    public FrontDeskDashboardDto getFrontDeskDashboard() {
        return FrontDeskDashboardDto.builder()
                .scheduledToday(14)
                .checkedIn(6)
                .noShows(1)
                .cancellations(2)
                .pendingCheckIn(5)
                .coPaysDue(3)
                .checkInQueue(List.of(
                        FrontDeskDashboardDto.CheckInItem.builder()
                                .patientName("James Anderson")
                                .mrn("PAT-10001")
                                .appointmentTime("10:00 AM")
                                .provider("Dr. Sarah Mitchell")
                                .insurancePlanName("BCBS PPO")
                                .status("CHECKED_IN")
                                .build()
                ))
                .build();
    }

    @Override
    public BillingDashboardDto getBillingDashboard() {
        return BillingDashboardDto.builder()
                .totalArAmount(new BigDecimal("66550.00"))
                .collectedThisMonth(new BigDecimal("42800.00"))
                .cleanClaimRate(94.2)
                .denialRate(5.8)
                .claimsPendingSubmission(18)
                .claimsDenied(12)
                .claimsNeedingAttention(8)
                .days30Ar(new BigDecimal("28400.00"))
                .days60Ar(new BigDecimal("18200.00"))
                .days90PlusAr(new BigDecimal("19950.00"))
                .build();
    }

    @Override
    public AdminDashboardDto getAdminDashboard() {
        return AdminDashboardDto.builder()
                .totalActivePatients(2847)
                .totalActiveProviders(6)
                .appointmentsThisMonth(412)
                .newPatientsThisMonth(34)
                .openLocations(3)
                .avgPatientSatisfaction(4.7)
                .providerUtilizationRate(82.4)
                .totalEncountersThisMonth(389)
                .build();
    }
}
