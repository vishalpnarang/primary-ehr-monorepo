package com.thinkitive.primus.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PharmacyDto {

    private Long id;
    private String name;
    private String npi;
    private String ncpdpId;
    private String phone;
    private String fax;
    private String addressLine1;
    private String city;
    private String state;
    private String zip;
    private boolean is24Hour;
    private Instant createdAt;
    private Instant modifiedAt;
}
