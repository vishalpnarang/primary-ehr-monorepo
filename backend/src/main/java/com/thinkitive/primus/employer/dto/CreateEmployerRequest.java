package com.thinkitive.primus.employer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateEmployerRequest {

    @NotBlank(message = "Employer name is required")
    private String name;

    private String taxId;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String address;
}
