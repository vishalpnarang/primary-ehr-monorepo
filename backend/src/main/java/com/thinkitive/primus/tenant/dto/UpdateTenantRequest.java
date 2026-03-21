package com.thinkitive.primus.tenant.dto;

import lombok.Data;

@Data
public class UpdateTenantRequest {

    private String name;
    private String npi;
    private String taxId;
    private String phone;
    private String fax;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String zip;
}
