package com.thinkitive.primus.careplan.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateCarePlanRequest {

    @Size(max = 255)
    private String title;

    private String description;

    /** ACTIVE | COMPLETED | CANCELLED */
    private String status;

    private LocalDate endDate;
}
