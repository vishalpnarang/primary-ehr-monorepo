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
public class PharmacyRequest {

    @NotBlank(message = "Pharmacy name is required")
    private String name;

    private String npi;
    private String ncpdpId;
    private String phone;
    private String fax;
    private String addressLine1;
    private String city;
    private String state;
    private String zip;
    private boolean twentyFourHour;
}
