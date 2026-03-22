package com.thinkitive.primus.notification.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationPreferenceDto {

    private String uuid;
    private String userId;
    private String eventType;
    private boolean channelEmail;
    private boolean channelSms;
    private boolean channelPush;
    private boolean channelInApp;
}
