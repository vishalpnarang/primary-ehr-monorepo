package com.thinkitive.primus.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class AddImagingResultRequest {

    private Long orderId;

    @NotNull
    private Long patientId;

    @NotBlank
    private String modality;

    private String studyDescription;
    private String radiologist;
    private String report;
    private String impression;
    private String status;
    private Instant resultDate;
}
