package com.thinkitive.primus.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class RecordPocResultRequest {

    @NotBlank
    private String pocTestUuid;

    @NotNull
    private Long patientId;

    private Long encounterId;

    @NotBlank
    private String results;

    private String performedBy;

    private Instant performedAt;
}
