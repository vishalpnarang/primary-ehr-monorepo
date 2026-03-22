package com.thinkitive.primus.careplan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateCarePlanRequest {

    @NotBlank
    private String patientUuid;

    @NotBlank
    @Size(max = 255)
    private String title;

    private String description;

    /** ACTIVE | COMPLETED | CANCELLED */
    private String status = "ACTIVE";

    @NotNull
    private LocalDate startDate;

    private LocalDate endDate;

    private String createdByProvider;
}
