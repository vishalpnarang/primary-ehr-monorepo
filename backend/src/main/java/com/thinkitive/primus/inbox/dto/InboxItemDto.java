package com.thinkitive.primus.inbox.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class InboxItemDto {

    private String uuid;
    private String itemType;  // LAB_RESULT | MESSAGE | REFILL_REQUEST | PRIOR_AUTH | TASK
    private String title;
    private String summary;
    private String patientName;
    private String patientUuid;
    private String priority;  // NORMAL | URGENT | CRITICAL
    private String status;    // PENDING | ACTIONED | ARCHIVED
    private String referenceUuid;  // UUID of the underlying order / message / etc.
    private Instant receivedAt;
    private Instant actionedAt;
}
