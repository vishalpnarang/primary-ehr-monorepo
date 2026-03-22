package com.thinkitive.primus.encounter.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AddProcedureRequest {

    @NotBlank
    @Size(max = 20)
    private String cptCode;

    @Size(max = 500)
    private String description;

    @Size(max = 10)
    private String modifier;

    @Min(1)
    private Integer units = 1;
}
