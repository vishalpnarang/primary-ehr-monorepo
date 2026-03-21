package com.thinkitive.primus.messaging.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TypingEvent {

    private String threadUuid;
    private String userId;
    private String displayName;
    private boolean typing;
}
