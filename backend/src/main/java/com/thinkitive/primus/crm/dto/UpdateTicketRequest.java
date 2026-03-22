package com.thinkitive.primus.crm.dto;

import lombok.Data;

@Data
public class UpdateTicketRequest {

    private String status;
    private String priority;
    private String category;
    private String assignedTo;
    private String description;
}
