package com.thinkitive.primus.careplan.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateActivityRequest {

    @Size(max = 500)
    private String description;

    @Size(max = 100)
    private String frequency;

    private String assignedTo;

    /** PENDING | IN_PROGRESS | COMPLETED | CANCELLED */
    private String status;

    private LocalDate dueDate;

    private LocalDate completedDate;
}
