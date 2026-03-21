package com.thinkitive.primus.billing.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClaimAppealRequest {

    @NotBlank private String appealReason;
    private String supportingDocuments;
}
