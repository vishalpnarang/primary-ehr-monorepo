package com.thinkitive.primus.messaging.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UnreadCountDto {

    private int unreadThreads;
    private int unreadMessages;
}
