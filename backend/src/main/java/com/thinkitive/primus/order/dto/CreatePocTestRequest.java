package com.thinkitive.primus.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreatePocTestRequest {

    @NotBlank
    private String name;

    private String category;

    @NotBlank
    private String resultFields;

    private String normalRanges;

    private String cptCode;
}
