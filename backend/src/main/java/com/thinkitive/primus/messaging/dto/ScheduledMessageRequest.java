package com.thinkitive.primus.messaging.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class ScheduledMessageRequest {

    @NotBlank(message = "Thread UUID is required")
    private String threadUuid;

    @NotBlank(message = "Message body is required")
    private String body;

    @NotNull(message = "Scheduled time is required")
    @Future(message = "Scheduled time must be in the future")
    private Instant scheduledAt;

    private boolean urgent = false;
}
