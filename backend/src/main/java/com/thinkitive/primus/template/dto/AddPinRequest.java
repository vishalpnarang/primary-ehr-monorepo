package com.thinkitive.primus.template.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AddPinRequest {

    /** UUID of the encounter this pin belongs to — optional (patient-level if absent). */
    private String encounterUuid;

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal xPosition;

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal yPosition;

    private String label;
    private String notes;
    private String color = "#FF0000";
}
