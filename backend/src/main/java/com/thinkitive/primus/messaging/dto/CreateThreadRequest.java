package com.thinkitive.primus.messaging.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreateThreadRequest {

    @NotBlank private String subject;
    private String threadType; // PATIENT_MESSAGE | INTERNAL | REFILL_REQUEST | LAB_RESULT | PA_REQUEST
    private UUID patientUuid;
    private List<String> participantIds; // user IDs (provider, staff)
    private String initialMessage;
}
