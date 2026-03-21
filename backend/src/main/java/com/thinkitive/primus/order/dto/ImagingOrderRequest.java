package com.thinkitive.primus.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;


@Data
public class ImagingOrderRequest {

    @NotNull  private String patientUuid;
    @NotNull  private String encounterUuid;
    @NotBlank private String modality;    // XRAY | MRI | CT | ULTRASOUND
    @NotBlank private String bodyPart;
    private String laterality;           // LEFT | RIGHT | BILATERAL
    private String icd10Code;
    private String priority;
    private String clinicalInfo;
    private String notes;
}
