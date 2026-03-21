package com.thinkitive.primus.patient.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreatePatientRequest {

    @NotBlank private String firstName;
    @NotBlank private String lastName;
    private String middleName;

    @NotNull @Past
    private LocalDate dateOfBirth;

    @NotBlank private String sex; // MALE | FEMALE | OTHER | UNKNOWN
    private String genderIdentity;

    @Pattern(regexp = "\\d{3}-\\d{2}-\\d{4}", message = "SSN must be XXX-XX-XXXX")
    private String ssn;

    @Pattern(regexp = "\\d{10}", message = "Phone must be 10 digits")
    private String phone;
    private String email;

    // Address
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String zip;

    // Insurance (primary)
    private String insurancePlanName;
    private String insuranceMemberId;
    private String insuranceGroupNumber;

    // Emergency contact
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelationship;

    private String primaryProviderId;
}
