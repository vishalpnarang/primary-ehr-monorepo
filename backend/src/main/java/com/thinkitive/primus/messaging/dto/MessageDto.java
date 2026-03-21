package com.thinkitive.primus.messaging.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class MessageDto {

    private UUID uuid;
    private UUID threadUuid;
    private String senderId;
    private String senderName;
    private String body;
    private boolean read;
    private Instant sentAt;
}
