package com.thinkitive.primus.employer.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
public class EmployerEmployeeDto {

    private String uuid;
    private Long employerId;
    private Long patientId;
    private String employeeId;
    private String department;
    private LocalDate startDate;
    private String status;
    private Instant createdAt;
}
