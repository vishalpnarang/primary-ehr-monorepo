package com.thinkitive.primus.scheduling.service;

import com.thinkitive.primus.scheduling.dto.*;
import com.thinkitive.primus.scheduling.entity.*;
import com.thinkitive.primus.scheduling.repository.*;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SchedulingAdminServiceImpl implements SchedulingAdminService {

    private final AppointmentTypeRepository appointmentTypeRepository;
    private final ProviderAvailabilityRepository providerAvailabilityRepository;
    private final BlockDayRepository blockDayRepository;
    private final StatusConfigurationRepository statusConfigurationRepository;

    // ── Appointment Types ─────────────────────────────────────────────────────

    @Override
    public List<AppointmentType> getAppointmentTypes(Long tenantId) {
        return appointmentTypeRepository.findByTenantIdAndArchiveFalse(tenantId);
    }

    @Override
    @Transactional
    public AppointmentType createAppointmentType(AppointmentTypeRequest request, Long tenantId) {
        log.info("Creating appointment type name={} tenant={}", request.getName(), tenantId);

        appointmentTypeRepository.findByNameAndTenantId(request.getName(), tenantId)
                .ifPresent(existing -> {
                    throw new PrimusException(ResponseCode.CONFLICT,
                            "Appointment type '" + request.getName() + "' already exists");
                });

        AppointmentType entity = AppointmentType.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .durationMinutes(request.getDurationMinutes())
                .color(request.getColor())
                .description(request.getDescription())
                .allowOnlineBooking(request.isAllowOnlineBooking())
                .build();

        return appointmentTypeRepository.save(entity);
    }

    @Override
    @Transactional
    public AppointmentType updateAppointmentType(Long id, AppointmentTypeRequest request, Long tenantId) {
        log.info("Updating appointment type id={} tenant={}", id, tenantId);

        AppointmentType entity = appointmentTypeRepository.findById(id)
                .filter(at -> at.getTenantId().equals(tenantId) && !at.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Appointment type not found: " + id));

        entity.setName(request.getName());
        entity.setDurationMinutes(request.getDurationMinutes());
        entity.setColor(request.getColor());
        entity.setDescription(request.getDescription());
        entity.setAllowOnlineBooking(request.isAllowOnlineBooking());

        return appointmentTypeRepository.save(entity);
    }

    // ── Provider Availability ─────────────────────────────────────────────────

    @Override
    public List<ProviderAvailability> getProviderAvailability(String providerId, Long tenantId) {
        return providerAvailabilityRepository.findByProviderIdAndTenantId(providerId, tenantId);
    }

    @Override
    @Transactional
    public ProviderAvailability setProviderAvailability(AvailabilityRequest request, Long tenantId) {
        log.info("Setting availability provider={} dayOfWeek={} tenant={}",
                request.getProviderId(), request.getDayOfWeek(), tenantId);

        // Upsert: if a slot for this provider+day already exists, update it.
        List<ProviderAvailability> existing = providerAvailabilityRepository
                .findByProviderIdAndDayOfWeekAndTenantId(
                        request.getProviderId(), request.getDayOfWeek(), tenantId);

        ProviderAvailability entity = existing.isEmpty()
                ? ProviderAvailability.builder()
                        .tenantId(tenantId)
                        .providerId(request.getProviderId())
                        .build()
                : existing.get(0);

        entity.setDayOfWeek(request.getDayOfWeek());
        entity.setStartTime(request.getStartTime());
        entity.setEndTime(request.getEndTime());
        entity.setLocationId(request.getLocationId());
        entity.setAppointmentTypeId(request.getAppointmentTypeId());
        entity.setActive(request.isActive());

        return providerAvailabilityRepository.save(entity);
    }

    // ── Block Days ────────────────────────────────────────────────────────────

    @Override
    public List<BlockDay> getBlockDays(String providerId, LocalDate from, LocalDate to, Long tenantId) {
        if (from != null && to != null) {
            return blockDayRepository.findByProviderIdAndBlockDateBetweenAndTenantId(
                    providerId, from, to, tenantId);
        }
        return blockDayRepository.findByProviderIdAndTenantId(providerId, tenantId);
    }

    @Override
    @Transactional
    public BlockDay createBlockDay(BlockDayRequest request, Long tenantId) {
        log.info("Creating block day provider={} date={} tenant={}",
                request.getProviderId(), request.getBlockDate(), tenantId);

        BlockDay entity = BlockDay.builder()
                .tenantId(tenantId)
                .providerId(request.getProviderId())
                .blockDate(request.getBlockDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .reason(request.getReason())
                .isAllDay(request.isAllDay())
                .build();

        return blockDayRepository.save(entity);
    }

    @Override
    @Transactional
    public void deleteBlockDay(Long id, Long tenantId) {
        log.info("Deleting block day id={} tenant={}", id, tenantId);

        BlockDay entity = blockDayRepository.findById(id)
                .filter(bd -> bd.getTenantId().equals(tenantId))
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Block day not found: " + id));

        blockDayRepository.delete(entity);
    }

    // ── Status Configurations ─────────────────────────────────────────────────

    @Override
    public List<StatusConfiguration> getStatusConfigurations(Long tenantId) {
        return statusConfigurationRepository.findByTenantIdAndArchiveFalseOrderByDisplayOrderAsc(tenantId);
    }

    @Override
    @Transactional
    public StatusConfiguration createStatusConfiguration(StatusConfigRequest request, Long tenantId) {
        log.info("Creating status config name={} {}→{} tenant={}",
                request.getName(), request.getFromStatus(), request.getToStatus(), tenantId);

        statusConfigurationRepository
                .findByNameAndFromStatusAndToStatusAndTenantId(
                        request.getName(), request.getFromStatus(), request.getToStatus(), tenantId)
                .ifPresent(existing -> {
                    throw new PrimusException(ResponseCode.CONFLICT,
                            "Status configuration already exists for this transition");
                });

        StatusConfiguration entity = StatusConfiguration.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .fromStatus(request.getFromStatus())
                .toStatus(request.getToStatus())
                .allowedRoles(request.getAllowedRoles())
                .color(request.getColor())
                .displayOrder(request.getDisplayOrder())
                .build();

        return statusConfigurationRepository.save(entity);
    }
}
