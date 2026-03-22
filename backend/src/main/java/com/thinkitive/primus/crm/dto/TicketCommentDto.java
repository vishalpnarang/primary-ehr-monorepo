package com.thinkitive.primus.crm.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TicketCommentDto {

    private String uuid;
    private String ticketUuid;
    private String userId;
    private String comment;
    private boolean internal;
    private Instant createdAt;
}
