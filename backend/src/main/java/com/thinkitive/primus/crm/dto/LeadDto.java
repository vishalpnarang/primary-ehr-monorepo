package com.thinkitive.primus.crm.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class LeadDto {

    private String uuid;
    private String name;
    private String email;
    private String phone;
    private String source;
    private String status;
    private String assignedTo;
    private String notes;
    private Instant createdAt;
    private Instant modifiedAt;
}
