package com.thinkitive.primus.crm.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class TicketDto {

    private String uuid;
    private String subject;
    private String description;
    private String status;
    private String priority;
    private String category;
    private String assignedTo;
    private Long patientId;
    private String reporterId;
    private List<TicketCommentDto> comments;
    private Instant createdAt;
    private Instant modifiedAt;
}
