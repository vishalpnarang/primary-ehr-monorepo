package com.thinkitive.primus.careplan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AddGoalRequest {

    @NotBlank
    @Size(max = 500)
    private String description;

    @Size(max = 100)
    private String targetValue;

    @Size(max = 100)
    private String currentValue;

    private LocalDate targetDate;

    /** IN_PROGRESS | MET | NOT_MET | CANCELLED */
    private String status = "IN_PROGRESS";
}
