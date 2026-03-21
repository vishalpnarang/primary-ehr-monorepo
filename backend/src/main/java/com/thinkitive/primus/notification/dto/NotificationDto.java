package com.thinkitive.primus.notification.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class NotificationDto {

    private String uuid;
    private String recipientId;
    private String type;       // LAB_RESULT | MESSAGE | APPOINTMENT | REFILL | PA | TASK | SYSTEM
    private String title;
    private String body;
    private String actionUrl;  // Deep link to the relevant screen
    private boolean read;
    private Instant createdAt;
    private Instant readAt;
}
