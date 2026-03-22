package com.thinkitive.primus.prescription.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class FormularyDto {

    private String uuid;
    private String drugName;
    private String genericName;
    private String ndc;
    private String rxnormCode;
    private String strength;
    private String form;
    private String route;
    private String drugClass;
    private String schedule;
    private boolean requiresPa;
    private Integer tier;
    private BigDecimal cost;
    private boolean isActive;
    private Instant createdAt;
    private Instant modifiedAt;
}
