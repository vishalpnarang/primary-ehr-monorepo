package com.thinkitive.primus.crm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddCommentRequest {

    @NotBlank(message = "Comment text is required")
    private String comment;

    private boolean internal = false;
}
