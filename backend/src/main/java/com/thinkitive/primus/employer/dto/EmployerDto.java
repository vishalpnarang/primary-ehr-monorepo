package com.thinkitive.primus.employer.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class EmployerDto {

    private String uuid;
    private String name;
    private String taxId;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String address;
    private String status;
    private Integer employeeCount;
    private Instant createdAt;
    private Instant modifiedAt;
}
