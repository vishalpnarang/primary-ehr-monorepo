package com.thinkitive.primus.scheduling.service;

import com.thinkitive.primus.patient.entity.Patient;
import com.thinkitive.primus.patient.repository.PatientRepository;
import com.thinkitive.primus.scheduling.dto.*;
import com.thinkitive.primus.scheduling.entity.Appointment;
import com.thinkitive.primus.scheduling.entity.Appointment.AppointmentStatus;
import com.thinkitive.primus.scheduling.entity.Appointment.AppointmentType;
import com.thinkitive.primus.scheduling.repository.AppointmentRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;

/**
 * Real JPA implementation for appointment scheduling.
 * All queries are tenant-scoped via TenantContext.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AppointmentServiceImpl implements AppointmentService {

    private static final int    SLOT_DURATION_MINUTES = 30;
    private static final int    DAY_START_HOUR        = 8;
    private static final int    DAY_END_HOUR          = 17;
    private static final ZoneId CLINIC_ZONE           = ZoneId.of("America/New_York");

    /** Valid status transitions: key → set of allowed next statuses. */
    private static final Map<AppointmentStatus, Set<AppointmentStatus>> TRANSITIONS =
            Map.of(
                AppointmentStatus.SCHEDULED,   EnumSet.of(AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW),
                AppointmentStatus.CONFIRMED,   EnumSet.of(AppointmentStatus.ARRIVED,   AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW),
                AppointmentStatus.ARRIVED,     EnumSet.of(AppointmentStatus.IN_ROOM,   AppointmentStatus.CANCELLED),
                AppointmentStatus.IN_ROOM,     EnumSet.of(AppointmentStatus.IN_PROGRESS),
                AppointmentStatus.IN_PROGRESS, EnumSet.of(AppointmentStatus.COMPLETED),
                AppointmentStatus.COMPLETED,   EnumSet.noneOf(AppointmentStatus.class),
                AppointmentStatus.CANCELLED,   EnumSet.noneOf(AppointmentStatus.class),
                AppointmentStatus.NO_SHOW,     EnumSet.noneOf(AppointmentStatus.class)
            );

    /** Terminal statuses excluded from conflict detection. */
    private static final List<AppointmentStatus> NON_BLOCKING =
            List.of(AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW);

    private static final String FIELD_PROVIDER_ID = "providerId";

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository     patientRepository;

    // ── Create ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public AppointmentDto createAppointment(CreateAppointmentRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating appointment tenant={} provider={} patient={}",
                tenantId, request.getProviderId(), request.getPatientUuid());

        Long providerId = parseLongId(request.getProviderId(), FIELD_PROVIDER_ID);
        Long locationId = request.getLocationId() != null
                ? parseLongId(request.getLocationId(), "locationId") : null;

        ZonedDateTime startZdt = request.getStartTime().atZone(CLINIC_ZONE);
        ZonedDateTime endZdt   = request.getEndTime().atZone(CLINIC_ZONE);
        LocalDate     date     = startZdt.toLocalDate();
        LocalTime     start    = startZdt.toLocalTime();
        LocalTime     end      = endZdt.toLocalTime();

        if (!end.isAfter(start)) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "End time must be after start time");
        }

        if (appointmentRepository.hasConflict(tenantId, providerId, date, start, end, NON_BLOCKING)) {
            throw new PrimusException(ResponseCode.APPOINTMENT_CONFLICT);
        }

        AppointmentType type = parseAppointmentType(request.getAppointmentType());
        int duration = (int) Duration.between(startZdt, endZdt).toMinutes();

        Appointment appointment = Appointment.builder()
                .tenantId(tenantId)
                .patientId(resolvePatientId(tenantId, request.getPatientUuid()))
                .providerId(providerId)
                .locationId(locationId != null ? locationId : 0L)
                .type(type)
                .status(AppointmentStatus.SCHEDULED)
                .date(date)
                .startTime(start)
                .endTime(end)
                .duration(duration)
                .reason(request.getChiefComplaint())
                .notes(request.getNotes())
                .build();

        Appointment saved = appointmentRepository.save(appointment);
        log.info("Appointment created uuid={}", saved.getUuid());
        return toDto(saved, request.getPatientUuid(), null, null);
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    @Override
    public AppointmentDto getAppointment(UUID uuid) {
        Long tenantId = TenantContext.getTenantId();
        Appointment apt = findOrThrow(uuid, tenantId);
        return toDto(apt, null, null, null);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public AppointmentDto updateAppointment(UUID uuid, UpdateAppointmentRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Appointment apt = findOrThrow(uuid, tenantId);

        if (apt.getStatus() == AppointmentStatus.CANCELLED) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Cannot update a cancelled appointment");
        }

        if (request.getStartTime() != null && request.getEndTime() != null) {
            ZonedDateTime startZdt = request.getStartTime().atZone(CLINIC_ZONE);
            ZonedDateTime endZdt   = request.getEndTime().atZone(CLINIC_ZONE);
            LocalDate date  = startZdt.toLocalDate();
            LocalTime start = startZdt.toLocalTime();
            LocalTime end   = endZdt.toLocalTime();

            if (!end.isAfter(start)) {
                throw new PrimusException(ResponseCode.BAD_REQUEST, "End time must be after start time");
            }

            // Conflict check excluding this appointment itself — exclude it by checking others only
            boolean conflict = appointmentRepository
                    .findByTenantIdAndDateAndProviderId(tenantId, date, apt.getProviderId())
                    .stream()
                    .filter(a -> !a.getUuid().equals(uuid))
                    .filter(a -> !NON_BLOCKING.contains(a.getStatus()))
                    .anyMatch(a -> a.getStartTime().isBefore(end) && a.getEndTime().isAfter(start));

            if (conflict) {
                throw new PrimusException(ResponseCode.APPOINTMENT_CONFLICT);
            }

            apt.setDate(date);
            apt.setStartTime(start);
            apt.setEndTime(end);
            apt.setDuration((int) Duration.between(startZdt, endZdt).toMinutes());
        }

        if (request.getAppointmentType() != null) {
            apt.setType(parseAppointmentType(request.getAppointmentType()));
        }
        if (request.getChiefComplaint() != null) apt.setReason(request.getChiefComplaint());
        if (request.getNotes()          != null) apt.setNotes(request.getNotes());
        if (request.getLocationId()     != null) {
            apt.setLocationId(parseLongId(request.getLocationId(), "locationId"));
        }

        Appointment saved = appointmentRepository.save(apt);
        return toDto(saved, null, null, null);
    }

    // ── Cancel ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public AppointmentDto cancelAppointment(UUID uuid) {
        Long tenantId = TenantContext.getTenantId();
        Appointment apt = findOrThrow(uuid, tenantId);

        if (apt.getStatus() == AppointmentStatus.COMPLETED) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Cannot cancel a completed appointment");
        }

        apt.setStatus(AppointmentStatus.CANCELLED);
        return toDto(appointmentRepository.save(apt), null, null, null);
    }

    // ── List ──────────────────────────────────────────────────────────────────

    @Override
    public Page<AppointmentDto> listAppointments(String providerId, String status, LocalDate date, Pageable pageable) {
        Long tenantId = TenantContext.getTenantId();
        Long provId   = providerId != null ? parseLongId(providerId, FIELD_PROVIDER_ID) : null;
        AppointmentStatus aptStatus = status != null ? parseStatus(status) : null;

        return appointmentRepository
                .filterAppointments(tenantId, provId, aptStatus, date, pageable)
                .map(a -> toDto(a, null, null, null));
    }

    // ── Status transition ─────────────────────────────────────────────────────

    @Override
    @Transactional
    public AppointmentDto updateStatus(UUID uuid, AppointmentStatusRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Appointment apt = findOrThrow(uuid, tenantId);

        AppointmentStatus newStatus = parseStatus(request.getStatus());
        AppointmentStatus current   = apt.getStatus();
        Set<AppointmentStatus> allowed = TRANSITIONS.getOrDefault(current, EnumSet.noneOf(AppointmentStatus.class));

        if (!allowed.contains(newStatus)) {
            throw new PrimusException(ResponseCode.BAD_REQUEST,
                    "Invalid transition: " + current + " → " + newStatus);
        }

        apt.setStatus(newStatus);
        if (request.getNotes() != null) {
            apt.setNotes(request.getNotes());
        }

        log.info("Appointment {} status: {} → {}", uuid, current, newStatus);
        return toDto(appointmentRepository.save(apt), null, null, null);
    }

    // ── Today's appointments ──────────────────────────────────────────────────

    @Override
    public List<AppointmentDto> getTodaysAppointments(String providerId) {
        Long tenantId = TenantContext.getTenantId();
        LocalDate today = LocalDate.now(CLINIC_ZONE);

        List<Appointment> appointments = (providerId != null)
                ? appointmentRepository.findByTenantIdAndDateAndProviderId(
                        tenantId, today, parseLongId(providerId, FIELD_PROVIDER_ID))
                : appointmentRepository.findByTenantIdAndDate(tenantId, today);

        return appointments.stream()
                .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED)
                .sorted(Comparator.comparing(Appointment::getStartTime))
                .map(a -> toDto(a, null, null, null))
                .toList();
    }

    // ── Available slots ───────────────────────────────────────────────────────

    @Override
    public List<TimeSlot> getAvailableSlots(String providerId, LocalDate date) {
        Long tenantId = TenantContext.getTenantId();
        Long provId   = parseLongId(providerId, FIELD_PROVIDER_ID);

        List<Appointment> existing = appointmentRepository
                .findByTenantIdAndDateAndProviderId(tenantId, date, provId)
                .stream()
                .filter(a -> !NON_BLOCKING.contains(a.getStatus()))
                .toList();

        List<TimeSlot> slots     = new ArrayList<>();
        LocalTime      cursor    = LocalTime.of(DAY_START_HOUR, 0);
        LocalTime      dayEnd    = LocalTime.of(DAY_END_HOUR, 0);

        while (cursor.isBefore(dayEnd)) {
            LocalTime slotEnd   = cursor.plusMinutes(SLOT_DURATION_MINUTES);
            boolean   occupied  = isOccupied(existing, cursor, slotEnd);

            slots.add(TimeSlot.builder()
                    .startTime(date.atTime(cursor).atZone(CLINIC_ZONE).toInstant())
                    .endTime(date.atTime(slotEnd).atZone(CLINIC_ZONE).toInstant())
                    .durationMinutes(SLOT_DURATION_MINUTES)
                    .available(!occupied)
                    .build());

            cursor = slotEnd;
        }

        return slots;
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Appointment findOrThrow(UUID uuid, Long tenantId) {
        return appointmentRepository.findByTenantIdAndUuid(tenantId, uuid)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND, "Appointment not found"));
    }

    private Long resolvePatientId(Long tenantId, UUID patientUuid) {
        Patient patient = patientRepository.findByTenantIdAndUuid(tenantId, patientUuid)
                .filter(p -> !p.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.PATIENT_NOT_FOUND));
        return patient.getId();
    }

    private boolean isOccupied(List<Appointment> existing, LocalTime slotStart, LocalTime slotEnd) {
        return existing.stream()
                .anyMatch(a -> a.getStartTime().isBefore(slotEnd) && a.getEndTime().isAfter(slotStart));
    }

    private AppointmentDto toDto(Appointment a, UUID patientUuid, String patientName, String patientMrn) {
        Instant startInstant = a.getDate().atTime(a.getStartTime()).atZone(CLINIC_ZONE).toInstant();
        Instant endInstant   = a.getDate().atTime(a.getEndTime()).atZone(CLINIC_ZONE).toInstant();

        return AppointmentDto.builder()
                .uuid(a.getUuid())
                .patientUuid(patientUuid)               // enriched by caller if needed
                .patientName(patientName)
                .patientMrn(patientMrn)
                .providerId(a.getProviderId() != null ? a.getProviderId().toString() : null)
                .startTime(startInstant)
                .endTime(endInstant)
                .appointmentType(a.getType() != null ? a.getType().name() : null)
                .status(a.getStatus() != null ? a.getStatus().name() : null)
                .locationId(a.getLocationId() != null ? a.getLocationId().toString() : null)
                .chiefComplaint(a.getReason())
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt())
                .build();
    }

    private AppointmentStatus parseStatus(String status) {
        try {
            return AppointmentStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException ignored) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Unknown appointment status: " + status);
        }
    }

    private AppointmentType parseAppointmentType(String type) {
        try {
            return AppointmentType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException ignored) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Unknown appointment type: " + type);
        }
    }

    private Long parseLongId(String value, String fieldName) {
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException ignored) {
            throw new PrimusException(ResponseCode.BAD_REQUEST,
                    "Invalid numeric id for field '" + fieldName + "': " + value);
        }
    }
}
