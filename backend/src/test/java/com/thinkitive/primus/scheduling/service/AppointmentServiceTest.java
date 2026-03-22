package com.thinkitive.primus.scheduling.service;

import com.thinkitive.primus.patient.entity.Patient;
import com.thinkitive.primus.patient.repository.PatientRepository;
import com.thinkitive.primus.scheduling.dto.*;
import com.thinkitive.primus.scheduling.entity.Appointment;
import com.thinkitive.primus.scheduling.entity.Appointment.AppointmentStatus;
import com.thinkitive.primus.scheduling.entity.Appointment.AppointmentType;
import com.thinkitive.primus.scheduling.repository.AppointmentRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.exception.PrimusException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.*;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class AppointmentServiceTest {

    private static final Long TENANT_ID = 1L;
    private static final ZoneId CLINIC_ZONE = ZoneId.of("America/New_York");

    @Mock AppointmentRepository appointmentRepo;
    @Mock PatientRepository patientRepo;

    @InjectMocks
    AppointmentServiceImpl appointmentService;

    @BeforeEach
    void setTenant() {
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    // ── createAppointment ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("createAppointment")
    class CreateAppointment {

        @Test
        @DisplayName("happy path -- creates appointment with SCHEDULED status")
        void createAppointment_happyPath() {
            String patientUuid = UUID.randomUUID().toString();
            Patient patient = buildPatient(patientUuid);

            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, patientUuid)).thenReturn(Optional.of(patient));
            when(appointmentRepo.hasConflict(eq(TENANT_ID), eq(1L), any(), any(), any(), any())).thenReturn(false);
            when(appointmentRepo.save(any(Appointment.class))).thenAnswer(inv -> {
                Appointment a = inv.getArgument(0);
                a.setId(1L);
                a.setUuid(UUID.randomUUID().toString());
                return a;
            });

            CreateAppointmentRequest request = buildCreateRequest(patientUuid,
                    "2026-03-25T14:00:00Z", "2026-03-25T14:30:00Z");

            AppointmentDto result = appointmentService.createAppointment(request);

            assertThat(result).isNotNull();
            assertThat(result.getStatus()).isEqualTo("SCHEDULED");
            assertThat(result.getUuid()).isNotNull();
            assertThat(result.getAppointmentType()).isEqualTo("FOLLOW_UP");
        }

        @Test
        @DisplayName("end time before start time -- throws BAD_REQUEST")
        void createAppointment_endBeforeStart_throws() {
            CreateAppointmentRequest request = buildCreateRequest(
                    UUID.randomUUID().toString(),
                    "2026-03-25T14:30:00Z", "2026-03-25T14:00:00Z");

            assertThatThrownBy(() -> appointmentService.createAppointment(request))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("End time must be after start time");
        }

        @Test
        @DisplayName("end time equals start time -- throws BAD_REQUEST")
        void createAppointment_endEqualsStart_throws() {
            Instant time = Instant.parse("2026-03-25T14:00:00Z");
            CreateAppointmentRequest request = new CreateAppointmentRequest();
            request.setPatientUuid(UUID.randomUUID().toString());
            request.setProviderId("1");
            request.setAppointmentType("FOLLOW_UP");
            request.setStartTime(time);
            request.setEndTime(time);

            assertThatThrownBy(() -> appointmentService.createAppointment(request))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("End time must be after start time");
        }

        @Test
        @DisplayName("conflict detected -- throws APPOINTMENT_CONFLICT")
        void createAppointment_conflict_throws() {
            String patientUuid = UUID.randomUUID().toString();
            Patient patient = buildPatient(patientUuid);

            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, patientUuid)).thenReturn(Optional.of(patient));
            when(appointmentRepo.hasConflict(eq(TENANT_ID), eq(1L), any(), any(), any(), any())).thenReturn(true);

            CreateAppointmentRequest request = buildCreateRequest(patientUuid,
                    "2026-03-25T14:00:00Z", "2026-03-25T14:30:00Z");

            assertThatThrownBy(() -> appointmentService.createAppointment(request))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("not available");
        }

        @Test
        @DisplayName("patient not found -- throws PATIENT_NOT_FOUND")
        void createAppointment_patientNotFound_throws() {
            String patientUuid = UUID.randomUUID().toString();
            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, patientUuid)).thenReturn(Optional.empty());

            CreateAppointmentRequest request = buildCreateRequest(patientUuid,
                    "2026-03-25T14:00:00Z", "2026-03-25T14:30:00Z");

            assertThatThrownBy(() -> appointmentService.createAppointment(request))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Patient not found");
        }

        @Test
        @DisplayName("invalid provider ID -- throws BAD_REQUEST")
        void createAppointment_invalidProviderId_throws() {
            CreateAppointmentRequest request = new CreateAppointmentRequest();
            request.setPatientUuid(UUID.randomUUID().toString());
            request.setProviderId("not-a-number");
            request.setAppointmentType("FOLLOW_UP");
            request.setStartTime(Instant.parse("2026-03-25T14:00:00Z"));
            request.setEndTime(Instant.parse("2026-03-25T14:30:00Z"));

            assertThatThrownBy(() -> appointmentService.createAppointment(request))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Invalid numeric id");
        }

        @Test
        @DisplayName("invalid appointment type -- throws BAD_REQUEST")
        void createAppointment_invalidType_throws() {
            String patientUuid = UUID.randomUUID().toString();
            Patient patient = buildPatient(patientUuid);

            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, patientUuid)).thenReturn(Optional.of(patient));
            when(appointmentRepo.hasConflict(eq(TENANT_ID), eq(1L), any(), any(), any(), any())).thenReturn(false);

            CreateAppointmentRequest request = new CreateAppointmentRequest();
            request.setPatientUuid(patientUuid);
            request.setProviderId("1");
            request.setAppointmentType("INVALID_TYPE");
            request.setStartTime(Instant.parse("2026-03-25T14:00:00Z"));
            request.setEndTime(Instant.parse("2026-03-25T14:30:00Z"));

            assertThatThrownBy(() -> appointmentService.createAppointment(request))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Unknown appointment type");
        }

        @Test
        @DisplayName("tenant_id is set from TenantContext")
        void createAppointment_setsTenantId() {
            String patientUuid = UUID.randomUUID().toString();
            Patient patient = buildPatient(patientUuid);

            when(patientRepo.findByTenantIdAndUuid(TENANT_ID, patientUuid)).thenReturn(Optional.of(patient));
            when(appointmentRepo.hasConflict(eq(TENANT_ID), eq(1L), any(), any(), any(), any())).thenReturn(false);
            when(appointmentRepo.save(any(Appointment.class))).thenAnswer(inv -> {
                Appointment a = inv.getArgument(0);
                assertThat(a.getTenantId()).isEqualTo(TENANT_ID);
                a.setId(1L);
                a.setUuid(UUID.randomUUID().toString());
                return a;
            });

            appointmentService.createAppointment(buildCreateRequest(patientUuid,
                    "2026-03-25T14:00:00Z", "2026-03-25T14:30:00Z"));

            verify(appointmentRepo).save(argThat(a -> a.getTenantId().equals(TENANT_ID)));
        }
    }

    // ── getAppointment ────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getAppointment")
    class GetAppointment {

        @Test
        @DisplayName("found -- returns DTO with all fields")
        void getAppointment_found() {
            String uuid = UUID.randomUUID().toString();
            Appointment apt = buildAppointment(uuid, AppointmentStatus.SCHEDULED,
                    LocalTime.of(9, 0), LocalTime.of(9, 30));

            when(appointmentRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(apt));

            AppointmentDto result = appointmentService.getAppointment(uuid);

            assertThat(result).isNotNull();
            assertThat(result.getUuid()).isEqualTo(uuid);
            assertThat(result.getStatus()).isEqualTo("SCHEDULED");
            assertThat(result.getStartTime()).isNotNull();
            assertThat(result.getEndTime()).isNotNull();
            assertThat(result.getProviderId()).isEqualTo("1");
        }

        @Test
        @DisplayName("not found -- throws PrimusException")
        void getAppointment_notFound_throws() {
            String uuid = UUID.randomUUID().toString();
            when(appointmentRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> appointmentService.getAppointment(uuid))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Appointment not found");
        }
    }

    // ── updateStatus ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("updateStatus")
    class UpdateStatus {

        @ParameterizedTest(name = "{0} -> {1} should succeed")
        @CsvSource({
                "SCHEDULED, CONFIRMED",
                "SCHEDULED, CANCELLED",
                "SCHEDULED, NO_SHOW",
                "CONFIRMED, ARRIVED",
                "CONFIRMED, CANCELLED",
                "CONFIRMED, NO_SHOW",
                "ARRIVED, IN_ROOM",
                "ARRIVED, CANCELLED",
                "IN_ROOM, IN_PROGRESS",
                "IN_PROGRESS, COMPLETED"
        })
        @DisplayName("valid transitions succeed")
        void updateStatus_validTransitions(String from, String to) {
            String uuid = UUID.randomUUID().toString();
            Appointment apt = buildAppointment(uuid, AppointmentStatus.valueOf(from),
                    LocalTime.of(9, 0), LocalTime.of(9, 30));

            when(appointmentRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(apt));
            when(appointmentRepo.save(any(Appointment.class))).thenAnswer(inv -> inv.getArgument(0));

            AppointmentStatusRequest request = new AppointmentStatusRequest();
            request.setStatus(to);

            AppointmentDto result = appointmentService.updateStatus(uuid, request);

            assertThat(result.getStatus()).isEqualTo(to);
        }

        @ParameterizedTest(name = "{0} -> {1} should be rejected")
        @CsvSource({
                "COMPLETED, SCHEDULED",
                "COMPLETED, IN_PROGRESS",
                "CANCELLED, SCHEDULED",
                "NO_SHOW, SCHEDULED",
                "SCHEDULED, IN_PROGRESS",
                "SCHEDULED, COMPLETED",
                "IN_ROOM, COMPLETED",
                "ARRIVED, COMPLETED"
        })
        @DisplayName("invalid transitions throw exception")
        void updateStatus_invalidTransitions(String from, String to) {
            String uuid = UUID.randomUUID().toString();
            Appointment apt = buildAppointment(uuid, AppointmentStatus.valueOf(from),
                    LocalTime.of(9, 0), LocalTime.of(9, 30));

            when(appointmentRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(apt));

            AppointmentStatusRequest request = new AppointmentStatusRequest();
            request.setStatus(to);

            assertThatThrownBy(() -> appointmentService.updateStatus(uuid, request))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Invalid transition");
        }

        @Test
        @DisplayName("invalid status string -- throws BAD_REQUEST")
        void updateStatus_invalidStatusString_throws() {
            String uuid = UUID.randomUUID().toString();
            Appointment apt = buildAppointment(uuid, AppointmentStatus.SCHEDULED,
                    LocalTime.of(9, 0), LocalTime.of(9, 30));

            when(appointmentRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(apt));

            AppointmentStatusRequest request = new AppointmentStatusRequest();
            request.setStatus("INVALID_STATUS");

            assertThatThrownBy(() -> appointmentService.updateStatus(uuid, request))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Unknown appointment status");
        }

        @Test
        @DisplayName("notes are preserved when provided")
        void updateStatus_preservesNotes() {
            String uuid = UUID.randomUUID().toString();
            Appointment apt = buildAppointment(uuid, AppointmentStatus.SCHEDULED,
                    LocalTime.of(9, 0), LocalTime.of(9, 30));

            when(appointmentRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(apt));
            when(appointmentRepo.save(any(Appointment.class))).thenAnswer(inv -> inv.getArgument(0));

            AppointmentStatusRequest request = new AppointmentStatusRequest();
            request.setStatus("CONFIRMED");
            request.setNotes("Patient confirmed via phone");

            appointmentService.updateStatus(uuid, request);

            verify(appointmentRepo).save(argThat(a -> "Patient confirmed via phone".equals(a.getNotes())));
        }
    }

    // ── cancelAppointment ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("cancelAppointment")
    class CancelAppointment {

        @Test
        @DisplayName("sets status to CANCELLED")
        void cancelAppointment_setsStatusCancelled() {
            String uuid = UUID.randomUUID().toString();
            Appointment apt = buildAppointment(uuid, AppointmentStatus.SCHEDULED,
                    LocalTime.of(9, 0), LocalTime.of(9, 30));

            when(appointmentRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(apt));
            when(appointmentRepo.save(any(Appointment.class))).thenAnswer(inv -> inv.getArgument(0));

            AppointmentDto result = appointmentService.cancelAppointment(uuid);

            assertThat(result.getStatus()).isEqualTo("CANCELLED");
        }

        @Test
        @DisplayName("completed appointment cannot be cancelled")
        void cancelAppointment_completed_throws() {
            String uuid = UUID.randomUUID().toString();
            Appointment apt = buildAppointment(uuid, AppointmentStatus.COMPLETED,
                    LocalTime.of(9, 0), LocalTime.of(9, 30));

            when(appointmentRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(apt));

            assertThatThrownBy(() -> appointmentService.cancelAppointment(uuid))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Cannot cancel a completed appointment");
        }

        @Test
        @DisplayName("not found -- throws exception")
        void cancelAppointment_notFound_throws() {
            String uuid = UUID.randomUUID().toString();
            when(appointmentRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> appointmentService.cancelAppointment(uuid))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Appointment not found");
        }
    }

    // ── todayAppointments ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("getTodaysAppointments")
    class TodaysAppointments {

        @Test
        @DisplayName("returns non-cancelled appointments sorted by start time")
        void getTodaysAppointments_filtersAndSorts() {
            LocalDate today = LocalDate.now(CLINIC_ZONE);

            Appointment apt1 = buildAppointment(AppointmentStatus.CONFIRMED, LocalTime.of(10, 0), LocalTime.of(10, 30));
            Appointment apt2 = buildAppointment(AppointmentStatus.SCHEDULED, LocalTime.of(9, 0), LocalTime.of(9, 30));
            Appointment cancelled = buildAppointment(AppointmentStatus.CANCELLED, LocalTime.of(11, 0), LocalTime.of(11, 30));

            when(appointmentRepo.findByTenantIdAndDateAndProviderId(TENANT_ID, today, 1L))
                    .thenReturn(List.of(apt1, apt2, cancelled));

            List<AppointmentDto> result = appointmentService.getTodaysAppointments("1");

            assertThat(result).hasSize(2);
            // Should be sorted: 9:00 before 10:00
            assertThat(result.get(0).getStatus()).isEqualTo("SCHEDULED");
            assertThat(result.get(1).getStatus()).isEqualTo("CONFIRMED");
        }

        @Test
        @DisplayName("no provider filter -- returns all appointments for today")
        void getTodaysAppointments_noProviderFilter() {
            LocalDate today = LocalDate.now(CLINIC_ZONE);
            Appointment apt = buildAppointment(AppointmentStatus.SCHEDULED, LocalTime.of(9, 0), LocalTime.of(9, 30));

            when(appointmentRepo.findByTenantIdAndDate(TENANT_ID, today))
                    .thenReturn(List.of(apt));

            List<AppointmentDto> result = appointmentService.getTodaysAppointments(null);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("all appointments have required fields")
        void getTodaysAppointments_requiredFields() {
            LocalDate today = LocalDate.now(CLINIC_ZONE);
            Appointment apt = buildAppointment(AppointmentStatus.SCHEDULED, LocalTime.of(9, 0), LocalTime.of(9, 30));

            when(appointmentRepo.findByTenantIdAndDateAndProviderId(TENANT_ID, today, 1L))
                    .thenReturn(List.of(apt));

            List<AppointmentDto> result = appointmentService.getTodaysAppointments("1");

            result.forEach(a -> {
                assertThat(a.getUuid()).isNotNull();
                assertThat(a.getStartTime()).isNotNull();
                assertThat(a.getEndTime()).isNotNull();
                assertThat(a.getProviderId()).isNotBlank();
                assertThat(a.getStatus()).isNotBlank();
            });
        }

        @Test
        @DisplayName("empty day -- returns empty list")
        void getTodaysAppointments_emptyDay() {
            LocalDate today = LocalDate.now(CLINIC_ZONE);
            when(appointmentRepo.findByTenantIdAndDateAndProviderId(TENANT_ID, today, 1L))
                    .thenReturn(Collections.emptyList());

            List<AppointmentDto> result = appointmentService.getTodaysAppointments("1");

            assertThat(result).isEmpty();
        }
    }

    // ── availableSlots ────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getAvailableSlots")
    class AvailableSlots {

        @Test
        @DisplayName("no existing appointments -- all 18 slots available (8am-5pm, 30min)")
        void getAvailableSlots_allFree() {
            LocalDate testDate = LocalDate.of(2026, 3, 25);
            when(appointmentRepo.findByTenantIdAndDateAndProviderId(TENANT_ID, testDate, 1L))
                    .thenReturn(Collections.emptyList());

            List<TimeSlot> slots = appointmentService.getAvailableSlots("1", testDate);

            assertThat(slots).hasSize(18);
            slots.forEach(s -> {
                assertThat(s.isAvailable()).isTrue();
                assertThat(s.getDurationMinutes()).isEqualTo(30);
            });
        }

        @Test
        @DisplayName("one booked slot -- 17 available, 1 occupied")
        void getAvailableSlots_oneBooked() {
            LocalDate testDate = LocalDate.of(2026, 3, 25);

            Appointment booked = buildAppointmentForDate(AppointmentStatus.CONFIRMED,
                    testDate, LocalTime.of(9, 0), LocalTime.of(9, 30));

            when(appointmentRepo.findByTenantIdAndDateAndProviderId(TENANT_ID, testDate, 1L))
                    .thenReturn(List.of(booked));

            List<TimeSlot> slots = appointmentService.getAvailableSlots("1", testDate);

            long available = slots.stream().filter(TimeSlot::isAvailable).count();
            long occupied = slots.stream().filter(s -> !s.isAvailable()).count();

            assertThat(available).isEqualTo(17);
            assertThat(occupied).isEqualTo(1);
        }

        @Test
        @DisplayName("cancelled appointment does NOT block slot")
        void getAvailableSlots_cancelledDoesNotBlock() {
            LocalDate testDate = LocalDate.of(2026, 3, 25);

            Appointment cancelled = buildAppointmentForDate(AppointmentStatus.CANCELLED,
                    testDate, LocalTime.of(9, 0), LocalTime.of(9, 30));

            when(appointmentRepo.findByTenantIdAndDateAndProviderId(TENANT_ID, testDate, 1L))
                    .thenReturn(List.of(cancelled));

            List<TimeSlot> slots = appointmentService.getAvailableSlots("1", testDate);

            // All 18 slots should be available -- cancelled is filtered out
            long available = slots.stream().filter(TimeSlot::isAvailable).count();
            assertThat(available).isEqualTo(18);
        }

        @Test
        @DisplayName("each slot is 30 minutes with start < end")
        void getAvailableSlots_slotDuration() {
            LocalDate testDate = LocalDate.of(2026, 3, 25);
            when(appointmentRepo.findByTenantIdAndDateAndProviderId(TENANT_ID, testDate, 1L))
                    .thenReturn(Collections.emptyList());

            List<TimeSlot> slots = appointmentService.getAvailableSlots("1", testDate);

            slots.forEach(slot -> {
                assertThat(slot.getDurationMinutes()).isEqualTo(30);
                assertThat(slot.getStartTime()).isBefore(slot.getEndTime());
            });
        }
    }

    // ── listAppointments ──────────────────────────────────────────────────────

    @Nested
    @DisplayName("listAppointments")
    class ListAppointments {

        @Test
        @DisplayName("returns paged results")
        void listAppointments_paged() {
            Appointment apt = buildAppointment(AppointmentStatus.SCHEDULED, LocalTime.of(9, 0), LocalTime.of(9, 30));
            PageRequest pageable = PageRequest.of(0, 20);

            when(appointmentRepo.filterAppointments(eq(TENANT_ID), isNull(), isNull(), isNull(), eq(pageable)))
                    .thenReturn(new PageImpl<>(List.of(apt), pageable, 1));

            Page<AppointmentDto> page = appointmentService.listAppointments(null, null, null, pageable);

            assertThat(page.getContent()).hasSize(1);
        }
    }

    // ── tenant isolation ──────────────────────────────────────────────────────

    @Test
    @DisplayName("all operations use tenant ID from TenantContext")
    void tenantIsolation_usesCorrectTenantId() {
        // Change tenant to 2
        TenantContext.setTenantId(2L);

        String uuid = UUID.randomUUID().toString();
        when(appointmentRepo.findByTenantIdAndUuid(2L, uuid)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> appointmentService.getAppointment(uuid))
                .isInstanceOf(PrimusException.class);

        verify(appointmentRepo).findByTenantIdAndUuid(eq(2L), eq(uuid));
        verify(appointmentRepo, never()).findByTenantIdAndUuid(eq(TENANT_ID), anyString());
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Appointment buildAppointment(String uuid, AppointmentStatus status, LocalTime start, LocalTime end) {
        Appointment apt = buildAppointment(status, start, end);
        apt.setUuid(uuid);
        return apt;
    }

    private Appointment buildAppointment(AppointmentStatus status, LocalTime start, LocalTime end) {
        LocalDate date = LocalDate.now(CLINIC_ZONE);
        Appointment apt = Appointment.builder()
                .tenantId(TENANT_ID)
                .patientId(1L)
                .providerId(1L)
                .locationId(1L)
                .type(AppointmentType.FOLLOW_UP)
                .status(status)
                .date(date)
                .startTime(start)
                .endTime(end)
                .duration(30)
                .build();
        apt.setId(System.nanoTime());
        apt.setUuid(UUID.randomUUID().toString());
        return apt;
    }

    private Appointment buildAppointmentForDate(AppointmentStatus status, LocalDate date,
                                                 LocalTime start, LocalTime end) {
        Appointment apt = Appointment.builder()
                .tenantId(TENANT_ID)
                .patientId(1L)
                .providerId(1L)
                .locationId(1L)
                .type(AppointmentType.FOLLOW_UP)
                .status(status)
                .date(date)
                .startTime(start)
                .endTime(end)
                .duration(30)
                .build();
        apt.setId(System.nanoTime());
        apt.setUuid(UUID.randomUUID().toString());
        return apt;
    }

    private Patient buildPatient(String uuid) {
        Patient patient = Patient.builder()
                .tenantId(TENANT_ID)
                .mrn("PAT-10001")
                .firstName("John")
                .lastName("Doe")
                .dob(LocalDate.of(1990, 1, 1))
                .sex("MALE")
                .status(Patient.PatientStatus.ACTIVE)
                .build();
        patient.setId(1L);
        patient.setUuid(uuid);
        return patient;
    }

    private CreateAppointmentRequest buildCreateRequest(String patientUuid, String start, String end) {
        CreateAppointmentRequest request = new CreateAppointmentRequest();
        request.setPatientUuid(patientUuid);
        request.setProviderId("1");
        request.setAppointmentType("FOLLOW_UP");
        request.setStartTime(Instant.parse(start));
        request.setEndTime(Instant.parse(end));
        request.setChiefComplaint("Follow-up visit");
        request.setLocationId("1");
        return request;
    }
}
