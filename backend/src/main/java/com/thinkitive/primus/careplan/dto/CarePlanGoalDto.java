package com.thinkitive.primus.careplan.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class CarePlanGoalDto {

    private String uuid;
    private String carePlanUuid;
    private String description;
    private String targetValue;
    private String currentValue;
    private LocalDate targetDate;
    private String status;
    private List<CarePlanActivityDto> activities;
    private Instant createdAt;
    private Instant modifiedAt;
}
