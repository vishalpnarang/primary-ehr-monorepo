package com.thinkitive.primus.crm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateTicketRequest {

    @NotBlank(message = "Subject is required")
    private String subject;

    private String description;
    private String priority;
    private String category;
    private String assignedTo;
    private Long patientId;
}
