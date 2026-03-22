package com.thinkitive.primus.template.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateMacroRequest {

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 50)
    private String abbreviation;

    @NotBlank
    private String expansion;

    /** SOAP | HPI | ROS | PE | AP | GENERAL */
    private String category;

    private boolean isShared = false;

    private String createdByProvider;
}
