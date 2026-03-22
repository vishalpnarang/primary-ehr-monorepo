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
public class FamilyHistoryDto {

    private Long id;
    private Long patientId;
    private String relationship;
    private String condition;
    private String icd10Code;
    private Integer onsetAge;
    private boolean deceased;
    private String notes;
    private Instant createdAt;
    private Instant modifiedAt;
}
