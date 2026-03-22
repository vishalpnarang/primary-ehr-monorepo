package com.thinkitive.primus.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialHistoryDto {

    private Long id;
    private Long patientId;
    private String smokingStatus;
    private String alcoholUse;
    private String drugUse;
    private String exerciseFrequency;
    private String diet;
    private String occupation;
    private String educationLevel;
    private String maritalStatus;
    private String housingStatus;
    private String notes;
    private Instant createdAt;
    private Instant modifiedAt;
}
