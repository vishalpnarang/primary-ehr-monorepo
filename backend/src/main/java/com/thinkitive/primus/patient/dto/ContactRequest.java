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
public class ContactRequest {

    /** Accepted values: SPECIALIST, FACILITY, LAB, OTHER */
    @NotBlank(message = "Contact type is required")
    private String type;

    @NotBlank(message = "Contact name is required")
    private String name;

    private String specialty;
    private String organization;
    private String npi;
    private String phone;
    private String fax;
    private String email;
    private String addressLine1;
    private String city;
    private String state;
    private String zip;
    private String notes;
}
