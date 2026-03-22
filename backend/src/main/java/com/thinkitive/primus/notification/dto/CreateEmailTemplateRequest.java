package com.thinkitive.primus.notification.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateEmailTemplateRequest {

    @NotBlank(message = "Template name is required")
    private String name;

    @NotBlank(message = "Subject template is required")
    private String subjectTemplate;

    @NotBlank(message = "Body template is required")
    private String bodyTemplate;

    private String category;
}
