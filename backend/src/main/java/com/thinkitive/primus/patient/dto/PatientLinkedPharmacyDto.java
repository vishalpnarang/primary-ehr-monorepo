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
public class PatientLinkedPharmacyDto {

    private Long id;
    private Long patientId;
    private Long pharmacyId;
    private boolean isPreferred;

    /** Pharmacy details (flattened for convenience) */
    private String pharmacyName;
    private String pharmacyPhone;
    private String pharmacyFax;
    private String pharmacyAddress;

    private Instant createdAt;
    private Instant modifiedAt;
}
