package com.thinkitive.primus.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SendNotificationRequest {

    @NotBlank(message = "Recipient ID is required")
    private String recipientId;

    @NotNull(message = "Channel is required (EMAIL, SMS, PUSH, IN_APP)")
    private String channel;

    @NotBlank(message = "Event type is required")
    private String eventType;

    private String subject;

    @NotBlank(message = "Body is required")
    private String body;
}
