package com.thinkitive.primus.order.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ImagingResultDto {

    private String uuid;
    private Long orderId;
    private Long patientId;
    private String modality;
    private String studyDescription;
    private String radiologist;
    private String report;
    private String impression;
    private String status;
    private Instant resultDate;
    private Instant createdAt;
    private Instant modifiedAt;
}
