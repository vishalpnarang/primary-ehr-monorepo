package com.thinkitive.primus.notification.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationCountDto {

    private int unread;
    private int total;
}
