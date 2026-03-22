package com.thinkitive.primus.patient.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyContactRequest {

    @NotBlank(message = "Contact name is required")
    private String name;

    private String relationship;

    @NotBlank(message = "Phone number is required")
    private String phone;

    private String email;
    private boolean isPrimary;
}
