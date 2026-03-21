package com.thinkitive.primus.scheduling.service;

import com.thinkitive.primus.scheduling.dto.AppointmentDto;
import com.thinkitive.primus.scheduling.dto.AppointmentStatusRequest;
import com.thinkitive.primus.scheduling.dto.TimeSlot;
import com.thinkitive.primus.scheduling.repository.AppointmentRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.exception.PrimusException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    AppointmentRepository appointmentRepo;

    @InjectMocks
    AppointmentServiceImpl appointmentService;

    @BeforeEach
    void setTenant() {
        TenantContext.setTenantId(1L);
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    @Test
    void getTodaysAppointments_shouldReturnList() {
        List<AppointmentDto> appointments = appointmentService.getTodaysAppointments("PRV-00001");

        assertThat(appointments).isNotNull();
        assertThat(appointments).hasSize(5);
        // First appointment is CHECKED_IN per stub logic
        assertThat(appointments.get(0).getStatus()).isEqualTo("CHECKED_IN");
        // Remaining appointments are SCHEDULED
        appointments.subList(1, appointments.size())
                .forEach(apt -> assertThat(apt.getStatus()).isEqualTo("SCHEDULED"));
    }

    @Test
    void getTodaysAppointments_allHaveRequiredFields() {
        List<AppointmentDto> appointments = appointmentService.getTodaysAppointments("PRV-00001");

        appointments.forEach(apt -> {
            assertThat(apt.getUuid()).isNotNull();
            assertThat(apt.getPatientUuid()).isNotNull();
            assertThat(apt.getStartTime()).isNotNull();
            assertThat(apt.getEndTime()).isNotNull();
            assertThat(apt.getProviderId()).isNotBlank();
        });
    }

    @Test
    void getAvailableSlots_shouldReturnOpenSlots() {
        LocalDate testDate = LocalDate.of(2026, 3, 25);

        List<TimeSlot> slots = appointmentService.getAvailableSlots("PRV-00001", testDate);

        assertThat(slots).isNotNull();
        assertThat(slots).isNotEmpty();
        // 9:00 AM to 5:00 PM in 20-min increments = 24 slots
        assertThat(slots).hasSize(24);
    }

    @Test
    void getAvailableSlots_eachSlotIs20Minutes() {
        LocalDate testDate = LocalDate.of(2026, 3, 25);

        List<TimeSlot> slots = appointmentService.getAvailableSlots("PRV-00001", testDate);

        slots.forEach(slot -> {
            assertThat(slot.getDurationMinutes()).isEqualTo(20);
            assertThat(slot.getStartTime()).isNotNull();
            assertThat(slot.getEndTime()).isNotNull();
            assertThat(slot.getEndTime()).isAfter(slot.getStartTime());
        });
    }

    @Test
    void updateStatus_invalidStatus_shouldThrow() {
        UUID uuid = UUID.randomUUID();
        AppointmentStatusRequest request = new AppointmentStatusRequest();
        request.setStatus("INVALID_STATUS");

        assertThatThrownBy(() -> appointmentService.updateStatus(uuid, request))
                .isInstanceOf(PrimusException.class)
                .hasMessageContaining("Invalid appointment status");
    }

    @Test
    void updateStatus_validStatus_shouldUpdateAppointment() {
        UUID uuid = UUID.randomUUID();
        AppointmentStatusRequest request = new AppointmentStatusRequest();
        request.setStatus("CONFIRMED");

        AppointmentDto result = appointmentService.updateStatus(uuid, request);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo("CONFIRMED");
    }

    @Test
    void cancelAppointment_shouldSetStatusCancelled() {
        UUID uuid = UUID.randomUUID();

        AppointmentDto result = appointmentService.cancelAppointment(uuid);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo("CANCELLED");
    }
}
