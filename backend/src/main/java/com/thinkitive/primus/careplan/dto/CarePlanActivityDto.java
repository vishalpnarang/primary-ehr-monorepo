package com.thinkitive.primus.careplan.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
public class CarePlanActivityDto {

    private String uuid;
    private String goalUuid;
    private String description;
    private String frequency;
    private String assignedTo;
    private String status;
    private LocalDate dueDate;
    private LocalDate completedDate;
    private Instant createdAt;
    private Instant modifiedAt;
}
