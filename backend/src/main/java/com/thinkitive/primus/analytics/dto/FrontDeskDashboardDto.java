package com.thinkitive.primus.analytics.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class FrontDeskDashboardDto {

    private int scheduledToday;
    private int checkedIn;
    private int noShows;
    private int cancellations;
    private int pendingCheckIn;
    private int coPaysDue;
    private List<CheckInItem> checkInQueue;

    @Data
    @Builder
    public static class CheckInItem {
        private String patientName;
        private String mrn;
        private String appointmentTime;
        private String provider;
        private String insurancePlanName;
        private String status;
    }
}
