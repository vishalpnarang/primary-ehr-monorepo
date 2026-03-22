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
public class ContactDto {

    private Long id;
    private String type;
    private String name;
    private String specialty;
    private String organization;
    private String npi;
    private String phone;
    private String fax;
    private String email;
    private String addressLine1;
    private String city;
    private String state;
    private String zip;
    private String notes;
    private Instant createdAt;
    private Instant modifiedAt;
}
