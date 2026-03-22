package com.thinkitive.primus.encounter.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.Instant;

@Data
public class UpdateVisitStatusRequest {

    /** CHECKED_IN | ROOMED | WITH_PROVIDER | CHECKOUT | COMPLETED | CANCELLED */
    @NotBlank
    private String status;

    /** Timestamp for the status transition — defaults to now() if absent. */
    private Instant timestamp;
}
