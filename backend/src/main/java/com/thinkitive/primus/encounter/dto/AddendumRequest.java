package com.thinkitive.primus.encounter.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddendumRequest {

    @NotBlank
    private String text;
}
