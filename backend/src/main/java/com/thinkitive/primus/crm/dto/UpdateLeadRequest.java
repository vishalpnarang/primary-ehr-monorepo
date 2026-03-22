package com.thinkitive.primus.crm.dto;

import lombok.Data;

@Data
public class UpdateLeadRequest {

    private String status;
    private String assignedTo;
    private String notes;
    private String email;
    private String phone;
}
