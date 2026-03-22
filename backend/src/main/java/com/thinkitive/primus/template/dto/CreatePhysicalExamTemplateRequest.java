package com.thinkitive.primus.template.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreatePhysicalExamTemplateRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    /** JSON array: [{section: string, findings: string[]}] */
    @NotBlank
    private String sections;

    private boolean isDefault = false;
}
