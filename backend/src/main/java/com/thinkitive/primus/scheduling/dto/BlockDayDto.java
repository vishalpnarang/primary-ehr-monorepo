package com.thinkitive.primus.scheduling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockDayDto {

    private Long id;
    private String providerId;
    private LocalDate blockDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String reason;
    private boolean isAllDay;
    private Instant createdAt;
    private Instant modifiedAt;
}
