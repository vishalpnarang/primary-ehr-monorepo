package com.thinkitive.primus.patient.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class PatientSearchResult {

    private UUID uuid;
    private String mrn;
    private String fullName;
    private LocalDate dateOfBirth;
    private String sex;
    private String phone;
    private String primaryProviderId;
}
