package com.thinkitive.primus.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateLabOrderSetRequest {

    @NotBlank
    private String name;

    private String description;

    @NotBlank
    private String tests;

    private String defaultIcdCodes;
}
