package com.thinkitive.primus.analytics.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class NurseDashboardDto {

    private int patientsToRoom;
    private int vitalsNeeded;
    private int medicationTasksPending;
    private List<RoomingTask> roomingQueue;

    @Data
    @Builder
    public static class RoomingTask {
        private String patientName;
        private String mrn;
        private String checkedInAt;
        private String appointmentType;
        private String assignedRoom;
        private String status; // WAITING | ROOMING | ROOMED
    }
}
