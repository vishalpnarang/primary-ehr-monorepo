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
public class PastSurgicalHistoryDto {

    private Long id;
    private Long patientId;
    private String procedureName;
    private LocalDate procedureDate;
    private String cptCode;
    private String surgeon;
    private String facility;
    private String notes;
    private Instant createdAt;
    private Instant modifiedAt;
}
