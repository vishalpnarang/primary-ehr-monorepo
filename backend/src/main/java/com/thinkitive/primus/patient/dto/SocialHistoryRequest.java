package com.thinkitive.primus.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialHistoryRequest {

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
}
