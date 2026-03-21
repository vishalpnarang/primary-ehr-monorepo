package com.thinkitive.primus.inbox.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InboxActionRequest {

    @NotBlank
    private String action;  // APPROVE | DENY | ASSIGN | COMPLETE | FORWARD
    private String notes;
    private String assigneeId;
}
