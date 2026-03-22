package com.thinkitive.primus.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PastMedicalHistoryDto {

    private Long id;
    private Long patientId;
    private String condition;
    private String icd10Code;
    private LocalDate onsetDate;
    private LocalDate resolutionDate;
    private String status;
    private String notes;
    private Instant createdAt;
    private Instant modifiedAt;
}
