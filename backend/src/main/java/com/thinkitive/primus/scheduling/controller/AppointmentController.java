package com.thinkitive.primus.scheduling.controller;

import com.thinkitive.primus.scheduling.dto.*;
import com.thinkitive.primus.scheduling.service.AppointmentService;
import com.thinkitive.primus.shared.controller.BaseController;
import com.thinkitive.primus.shared.dto.ApiResponse;
import com.thinkitive.primus.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentController extends BaseController {

    private final AppointmentService appointmentService;

    /** POST /api/v1/appointments */
    @PostMapping
    public ResponseEntity<ApiResponse> createAppointment(@Valid @RequestBody CreateAppointmentRequest request) {
        return created(appointmentService.createAppointment(request), "Appointment scheduled");
    }

    /** GET /api/v1/appointments/{uuid} */
    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse> getAppointment(@PathVariable String uuid) {
        return ok(appointmentService.getAppointment(uuid));
    }

    /** PUT /api/v1/appointments/{uuid} */
    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse> updateAppointment(
            @PathVariable String uuid,
            @Valid @RequestBody UpdateAppointmentRequest request) {
        return ok(appointmentService.updateAppointment(uuid, request), "Appointment updated");
    }

    /** DELETE /api/v1/appointments/{uuid} — cancel */
    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse> cancelAppointment(@PathVariable String uuid) {
        return ok(appointmentService.cancelAppointment(uuid), "Appointment cancelled");
    }

    /** GET /api/v1/appointments?providerId=&status=&date= */
    @GetMapping
    public ResponseEntity<ApiResponse> listAppointments(
            @RequestParam(required = false) String providerId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PageableDefault(size = 20) Pageable pageable) {
        return ok(PageResponse.from(appointmentService.listAppointments(providerId, status, date, pageable)));
    }

    /** PATCH /api/v1/appointments/{uuid}/status */
    @PatchMapping("/{uuid}/status")
    public ResponseEntity<ApiResponse> updateStatus(
            @PathVariable String uuid,
            @Valid @RequestBody AppointmentStatusRequest request) {
        return ok(appointmentService.updateStatus(uuid, request), "Status updated to " + request.getStatus());
    }

    /** GET /api/v1/appointments/today?providerId= */
    @GetMapping("/today")
    public ResponseEntity<ApiResponse> getTodaysAppointments(
            @RequestParam(required = false) String providerId) {
        return ok(appointmentService.getTodaysAppointments(providerId));
    }

    /** GET /api/v1/appointments/available-slots?providerId=&date= */
    @GetMapping("/available-slots")
    public ResponseEntity<ApiResponse> getAvailableSlots(
            @RequestParam String providerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ok(appointmentService.getAvailableSlots(providerId, date));
    }
}
