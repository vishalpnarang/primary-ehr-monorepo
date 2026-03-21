package com.thinkitive.primus.messaging.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class MessageDto {

    private String uuid;
    private String threadUuid;
    private String senderId;
    private String senderName;
    private String body;
    private boolean read;
    private Instant sentAt;
}
