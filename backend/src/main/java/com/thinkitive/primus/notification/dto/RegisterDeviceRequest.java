package com.thinkitive.primus.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterDeviceRequest {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Token is required")
    private String token;

    @NotNull(message = "Platform is required (WEB, IOS, ANDROID)")
    private String platform;

    private String deviceName;
}
