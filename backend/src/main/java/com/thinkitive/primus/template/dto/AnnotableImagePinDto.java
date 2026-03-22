package com.thinkitive.primus.template.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class AnnotableImagePinDto {

    private String uuid;
    private String imageUuid;
    private String encounterUuid;
    private String patientUuid;
    private BigDecimal xPosition;
    private BigDecimal yPosition;
    private String label;
    private String notes;
    private String color;
    private Instant createdAt;
    private Instant modifiedAt;
}
