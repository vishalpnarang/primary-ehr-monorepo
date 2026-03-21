package com.thinkitive.primus.analytics.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProviderDashboardDto {

    private int todayAppointmentsTotal;
    private int todayAppointmentsCompleted;
    private int todayAppointmentsPending;
    private int inboxItemsUnread;
    private int pendingSignatures;
    private int labResultsPending;
    private int refillRequestsPending;
    private List<AppointmentSummary> upcomingAppointments;

    @Data
    @Builder
    public static class AppointmentSummary {
        private String patientName;
        private String time;
        private String type;
        private String status;
        private String chiefComplaint;
    }
}
