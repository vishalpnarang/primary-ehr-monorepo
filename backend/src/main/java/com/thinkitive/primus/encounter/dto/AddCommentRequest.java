package com.thinkitive.primus.encounter.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddCommentRequest {

    @NotBlank
    private String comment;
}
