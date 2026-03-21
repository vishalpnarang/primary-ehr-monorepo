package com.thinkitive.primus.scheduling.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class UpdateAppointmentRequest {

    private Instant startTime;
    private Instant endTime;
    private String appointmentType;
    private String locationId;
    private String chiefComplaint;
    private String notes;
}
