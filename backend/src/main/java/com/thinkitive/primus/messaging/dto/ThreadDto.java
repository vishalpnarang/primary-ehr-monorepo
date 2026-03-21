package com.thinkitive.primus.messaging.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class ThreadDto {

    private String uuid;
    private String subject;
    private String threadType;
    private String patientUuid;
    private String patientName;
    private List<String> participantIds;
    private int unreadCount;
    private MessageDto lastMessage;
    private Instant createdAt;
    private Instant updatedAt;
    private boolean archived;
}
