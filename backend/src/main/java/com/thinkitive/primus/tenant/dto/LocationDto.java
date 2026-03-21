package com.thinkitive.primus.tenant.dto;

import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class LocationDto {

    private String uuid;
    private String name;
    private String addressLine1;
    private String city;
    private String state;
    private String zip;
    private String phone;
    private String fax;
    private boolean active;
}
