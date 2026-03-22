package com.thinkitive.primus.notification.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class EmailTemplateDto {

    private String uuid;
    private String name;
    private String subjectTemplate;
    private String bodyTemplate;
    private String category;
    private Instant createdAt;
    private Instant modifiedAt;
}
