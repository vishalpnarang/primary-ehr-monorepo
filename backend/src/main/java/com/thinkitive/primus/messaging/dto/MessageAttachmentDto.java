package com.thinkitive.primus.messaging.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class MessageAttachmentDto {

    private String uuid;
    private String messageUuid;
    private String fileName;
    private String fileUrl;
    private Long fileSize;
    private String contentType;
    private Instant createdAt;
}
