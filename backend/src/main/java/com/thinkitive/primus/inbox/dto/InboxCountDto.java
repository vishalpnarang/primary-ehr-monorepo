package com.thinkitive.primus.inbox.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InboxCountDto {

    private int labResults;
    private int messages;
    private int refillRequests;
    private int priorAuths;
    private int tasks;
    private int total;
}
