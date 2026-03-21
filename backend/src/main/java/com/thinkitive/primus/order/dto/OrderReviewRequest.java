package com.thinkitive.primus.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrderReviewRequest {

    @NotBlank private String reviewNote;
    private boolean patientNotified;
    private String followUpAction; // NONE | SCHEDULE_VISIT | ADJUST_MEDICATION | REFER
}
