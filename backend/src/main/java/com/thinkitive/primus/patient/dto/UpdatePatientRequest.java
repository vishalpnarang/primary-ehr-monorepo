package com.thinkitive.primus.patient.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdatePatientRequest {

    private String firstName;
    private String lastName;
    private String middleName;
    private LocalDate dateOfBirth;
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
    private String insuranceGroupNumber;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelationship;
    private String primaryProviderId;
}
