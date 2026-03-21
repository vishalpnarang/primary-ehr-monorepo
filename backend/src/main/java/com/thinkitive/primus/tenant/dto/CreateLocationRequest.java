package com.thinkitive.primus.tenant.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateLocationRequest {

    @NotBlank private String name;
    private String addressLine1;
    private String city;
    private String state;
    private String zip;
    private String phone;
    private String fax;
}
