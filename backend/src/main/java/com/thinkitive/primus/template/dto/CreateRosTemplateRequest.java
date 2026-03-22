package com.thinkitive.primus.template.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateRosTemplateRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    /** JSON array: [{system: string, findings: string[]}] */
    @NotBlank
    private String systems;

    private boolean isDefault = false;
}
