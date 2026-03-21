package com.thinkitive.primus.patient.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
public class PatientDto {

    private String uuid;
    private String mrn;
    private String firstName;
    private String lastName;
    private String middleName;
    private LocalDate dateOfBirth;
    private int ageYears;
    private String sex;
    private String genderIdentity;
    private String phone;
    private String email;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String zip;
    private String insurancePlanName;
    private String insuranceMemberId;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String primaryProviderId;
    private boolean archived;
    private Instant createdAt;
    private Instant modifiedAt;
}
