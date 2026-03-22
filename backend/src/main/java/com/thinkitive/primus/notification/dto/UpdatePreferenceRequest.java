package com.thinkitive.primus.notification.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdatePreferenceRequest {

    @NotBlank(message = "Event type is required")
    private String eventType;

    private Boolean channelEmail;
    private Boolean channelSms;
    private Boolean channelPush;
    private Boolean channelInApp;
}
