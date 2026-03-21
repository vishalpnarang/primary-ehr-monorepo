package com.thinkitive.primus.scheduling.service;

import com.thinkitive.primus.scheduling.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AppointmentService {

    AppointmentDto createAppointment(CreateAppointmentRequest request);

    AppointmentDto getAppointment(UUID uuid);

    AppointmentDto updateAppointment(UUID uuid, UpdateAppointmentRequest request);

    AppointmentDto cancelAppointment(UUID uuid);

    Page<AppointmentDto> listAppointments(String providerId, String status, LocalDate date, Pageable pageable);

    AppointmentDto updateStatus(UUID uuid, AppointmentStatusRequest request);

    List<AppointmentDto> getTodaysAppointments(String providerId);

    List<TimeSlot> getAvailableSlots(String providerId, LocalDate date);
}
