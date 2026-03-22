package com.thinkitive.primus.notification.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class NotificationLogDto {

    private String uuid;
    private String recipientId;
    private String channel;
    private String eventType;
    private String subject;
    private String body;
    private String status;
    private String errorMessage;
    private String externalId;
    private Instant createdAt;
}
