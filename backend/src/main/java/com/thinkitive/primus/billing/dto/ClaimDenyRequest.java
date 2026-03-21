package com.thinkitive.primus.billing.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClaimDenyRequest {

    @NotBlank private String denialCode;
    @NotBlank private String denialReason;
}
