package com.thinkitive.primus.careplan.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class CarePlanDto {

    private String uuid;
    private String patientUuid;
    private String title;
    private String description;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String createdByProvider;
    private List<CarePlanGoalDto> goals;
    private Instant createdAt;
    private Instant modifiedAt;
}
