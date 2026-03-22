package com.thinkitive.primus.employer.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AddEmployeeRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private String employeeId;
    private String department;
    private LocalDate startDate;
}
