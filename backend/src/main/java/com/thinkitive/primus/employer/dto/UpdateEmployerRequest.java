package com.thinkitive.primus.employer.dto;

import lombok.Data;

@Data
public class UpdateEmployerRequest {

    private String name;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String address;
    private String status;
}
