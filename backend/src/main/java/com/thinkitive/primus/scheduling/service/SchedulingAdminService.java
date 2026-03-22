package com.thinkitive.primus.scheduling.service;

import com.thinkitive.primus.scheduling.dto.*;
import com.thinkitive.primus.scheduling.entity.*;

import java.time.LocalDate;
import java.util.List;

public interface SchedulingAdminService {

    // ── Appointment Types ─────────────────────────────────────────────────────

    List<AppointmentType> getAppointmentTypes(Long tenantId);

    AppointmentType createAppointmentType(AppointmentTypeRequest request, Long tenantId);

    AppointmentType updateAppointmentType(Long id, AppointmentTypeRequest request, Long tenantId);

    // ── Provider Availability ─────────────────────────────────────────────────

    List<ProviderAvailability> getProviderAvailability(String providerId, Long tenantId);

    ProviderAvailability setProviderAvailability(AvailabilityRequest request, Long tenantId);

    // ── Block Days ────────────────────────────────────────────────────────────

    List<BlockDay> getBlockDays(String providerId, LocalDate from, LocalDate to, Long tenantId);

    BlockDay createBlockDay(BlockDayRequest request, Long tenantId);

    void deleteBlockDay(Long id, Long tenantId);

    // ── Status Configurations ─────────────────────────────────────────────────

    List<StatusConfiguration> getStatusConfigurations(Long tenantId);

    StatusConfiguration createStatusConfiguration(StatusConfigRequest request, Long tenantId);
}
