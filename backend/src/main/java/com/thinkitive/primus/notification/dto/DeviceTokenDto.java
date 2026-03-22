package com.thinkitive.primus.notification.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class DeviceTokenDto {

    private String uuid;
    private String userId;
    private String platform;
    private String deviceName;
    private boolean active;
    private Instant createdAt;
}
