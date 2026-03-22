package com.thinkitive.primus.order.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class LabCatalogDto {

    private String uuid;
    private String testCode;
    private String testName;
    private String specimenType;
    private String container;
    private String volume;
    private String stability;
    private String cptCode;
    private String loincCode;
    private String department;
    private boolean isActive;
    private Instant createdAt;
    private Instant modifiedAt;
}
