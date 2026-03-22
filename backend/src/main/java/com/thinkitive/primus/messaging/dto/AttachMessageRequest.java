package com.thinkitive.primus.messaging.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AttachMessageRequest {

    @NotNull(message = "Message UUID is required")
    private String messageUuid;

    @NotBlank(message = "File name is required")
    private String fileName;

    @NotBlank(message = "File URL is required")
    private String fileUrl;

    private Long fileSize;

    private String contentType;
}
