package com.thinkitive.primus.messaging.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ThreadDto {

    private UUID uuid;
    private String subject;
    private String threadType;
    private UUID patientUuid;
    private String patientName;
    private List<String> participantIds;
    private int unreadCount;
    private MessageDto lastMessage;
    private Instant createdAt;
    private Instant updatedAt;
    private boolean archived;
}
