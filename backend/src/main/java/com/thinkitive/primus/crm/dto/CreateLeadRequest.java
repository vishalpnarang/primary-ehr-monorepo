package com.thinkitive.primus.crm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateLeadRequest {

    @NotBlank(message = "Lead name is required")
    private String name;

    private String email;
    private String phone;
    private String source;
    private String assignedTo;
    private String notes;
}
