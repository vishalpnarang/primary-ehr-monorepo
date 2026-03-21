package com.thinkitive.primus.scheduling.service;

import com.thinkitive.primus.scheduling.dto.*;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Phase-0 stub — in-memory mock. Phase 2: replace with JPA + conflict queries.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AppointmentServiceImpl implements AppointmentService {

    private static final int SLOT_DURATION_MINUTES = 20;

    private static final List<String> VALID_TRANSITIONS = List.of(
            "SCHEDULED", "CONFIRMED", "CHECKED_IN", "ROOMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"
    );

    @Override
    @Transactional
    public AppointmentDto createAppointment(CreateAppointmentRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating appointment tenant={} provider={} patient={}", tenantId, request.getProviderId(), request.getPatientUuid());

        // Phase 2: check overlap with existing appointments for provider in time window
        // Phase 2: validate provider schedule / availability

        return AppointmentDto.builder()
                .uuid(UUID.randomUUID())
                .patientUuid(request.getPatientUuid())
                .patientName("James Anderson")
                .patientMrn("PAT-10001")
                .providerId(request.getProviderId())
                .providerName("Dr. Sarah Mitchell")
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .appointmentType(request.getAppointmentType())
                .status("SCHEDULED")
                .locationId(request.getLocationId())
                .chiefComplaint(request.getChiefComplaint())
                .notes(request.getNotes())
                .createdAt(Instant.now())
                .build();
    }

    @Override
    public AppointmentDto getAppointment(UUID uuid) {
        return buildMockAppointment(uuid, "SCHEDULED");
    }

    @Override
    @Transactional
    public AppointmentDto updateAppointment(UUID uuid, UpdateAppointmentRequest request) {
        AppointmentDto apt = getAppointment(uuid);
        if ("CANCELLED".equals(apt.getStatus())) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Cannot update a cancelled appointment");
        }
        if (request.getStartTime() != null) apt.setStartTime(request.getStartTime());
        if (request.getEndTime()   != null) apt.setEndTime(request.getEndTime());
        if (request.getChiefComplaint() != null) apt.setChiefComplaint(request.getChiefComplaint());
        return apt;
    }

    @Override
    @Transactional
    public AppointmentDto cancelAppointment(UUID uuid) {
        AppointmentDto apt = getAppointment(uuid);
        apt.setStatus("CANCELLED");
        return apt;
    }

    @Override
    public Page<AppointmentDto> listAppointments(String providerId, String status, LocalDate date, Pageable pageable) {
        List<AppointmentDto> list = List.of(buildMockAppointment(UUID.randomUUID(), status != null ? status : "SCHEDULED"));
        return new PageImpl<>(list, pageable, list.size());
    }

    @Override
    @Transactional
    public AppointmentDto updateStatus(UUID uuid, AppointmentStatusRequest request) {
        if (!VALID_TRANSITIONS.contains(request.getStatus())) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Invalid appointment status: " + request.getStatus());
        }
        AppointmentDto apt = getAppointment(uuid);
        apt.setStatus(request.getStatus());
        return apt;
    }

    @Override
    public List<AppointmentDto> getTodaysAppointments(String providerId) {
        List<AppointmentDto> list = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            list.add(buildMockAppointment(UUID.randomUUID(), i == 0 ? "CHECKED_IN" : "SCHEDULED"));
        }
        return list;
    }

    @Override
    public List<TimeSlot> getAvailableSlots(String providerId, LocalDate date) {
        List<TimeSlot> slots = new ArrayList<>();
        ZonedDateTime start = date.atTime(9, 0).atZone(ZoneId.of("America/New_York"));
        ZonedDateTime end   = date.atTime(17, 0).atZone(ZoneId.of("America/New_York"));

        ZonedDateTime cursor = start;
        while (cursor.isBefore(end)) {
            ZonedDateTime slotEnd = cursor.plusMinutes(SLOT_DURATION_MINUTES);
            slots.add(TimeSlot.builder()
                    .startTime(cursor.toInstant())
                    .endTime(slotEnd.toInstant())
                    .durationMinutes(SLOT_DURATION_MINUTES)
                    .available(Math.random() > 0.3) // mock: ~70% available
                    .build());
            cursor = slotEnd;
        }
        return slots;
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private AppointmentDto buildMockAppointment(UUID uuid, String status) {
        Instant now = Instant.now();
        return AppointmentDto.builder()
                .uuid(uuid)
                .patientUuid(UUID.fromString("aaaaaaaa-0000-0000-0000-000000000001"))
                .patientName("James Anderson")
                .patientMrn("PAT-10001")
                .providerId("PRV-00001")
                .providerName("Dr. Sarah Mitchell")
                .startTime(now.plusSeconds(3600))
                .endTime(now.plusSeconds(4800))
                .appointmentType("OFFICE_VISIT")
                .status(status)
                .chiefComplaint("Annual physical exam")
                .createdAt(now)
                .build();
    }
}
