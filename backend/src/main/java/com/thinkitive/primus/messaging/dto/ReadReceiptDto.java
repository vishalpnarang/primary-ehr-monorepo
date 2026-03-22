package com.thinkitive.primus.messaging.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ReadReceiptDto {

    private String uuid;
    private String messageUuid;
    private String userId;
    private Instant readAt;
}
