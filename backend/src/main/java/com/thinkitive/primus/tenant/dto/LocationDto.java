package com.thinkitive.primus.tenant.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class LocationDto {

    private UUID uuid;
    private String name;
    private String addressLine1;
    private String city;
    private String state;
    private String zip;
    private String phone;
    private String fax;
    private boolean active;
}
