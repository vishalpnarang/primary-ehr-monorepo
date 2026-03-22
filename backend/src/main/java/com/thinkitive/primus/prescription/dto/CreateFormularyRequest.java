package com.thinkitive.primus.prescription.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateFormularyRequest {

    @NotBlank
    private String drugName;

    private String genericName;
    private String ndc;
    private String rxnormCode;
    private String strength;
    private String form;
    private String route;
    private String drugClass;
    private String schedule;
    private boolean requiresPa = false;
    private Integer tier;
    private BigDecimal cost;
}
