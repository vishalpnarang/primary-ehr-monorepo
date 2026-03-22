package com.thinkitive.primus.patient.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PastSurgicalHistoryRequest {

    @NotBlank(message = "Procedure name is required")
    private String procedureName;

    private LocalDate procedureDate;
    private String cptCode;
    private String surgeon;
    private String facility;
    private String notes;
}
