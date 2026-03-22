package com.thinkitive.primus.scheduling.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockDayRequest {

    @NotBlank(message = "Provider ID is required")
    private String providerId;

    @NotNull(message = "Block date is required")
    private LocalDate blockDate;

    private LocalTime startTime;
    private LocalTime endTime;
    private String reason;
    private boolean isAllDay = true;
}
