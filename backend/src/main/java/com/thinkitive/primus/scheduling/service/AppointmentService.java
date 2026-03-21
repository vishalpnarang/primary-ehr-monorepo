package com.thinkitive.primus.scheduling.service;

import com.thinkitive.primus.scheduling.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentService {

    AppointmentDto createAppointment(CreateAppointmentRequest request);

    AppointmentDto getAppointment(String uuid);

    AppointmentDto updateAppointment(String uuid, UpdateAppointmentRequest request);

    AppointmentDto cancelAppointment(String uuid);

    Page<AppointmentDto> listAppointments(String providerId, String status, LocalDate date, Pageable pageable);

    AppointmentDto updateStatus(String uuid, AppointmentStatusRequest request);

    List<AppointmentDto> getTodaysAppointments(String providerId);

    List<TimeSlot> getAvailableSlots(String providerId, LocalDate date);
}
