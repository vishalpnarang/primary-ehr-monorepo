package com.thinkitive.primus.template.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

/**
 * Read-only DTO representing a form submission returned to the client.
 */
@Data
@Builder
public class FormSubmissionDto {

    private String uuid;
    private Long templateId;
    private String templateName;
    private Long patientId;
    private String submittedBy;
    private String submissionData;
    private String status;
    private String reviewedBy;
    private Instant reviewedAt;
    private Instant createdAt;
    private Instant modifiedAt;
}
