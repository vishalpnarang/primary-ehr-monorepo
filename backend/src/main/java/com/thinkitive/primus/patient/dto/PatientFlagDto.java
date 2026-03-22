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
public class PatientFlagDto {

    private Long id;
    private Long patientId;
    private String flagType;
    private String label;
    private String severity;
    private boolean active;
    private String notes;
    private Instant createdAt;
    private Instant modifiedAt;
}
