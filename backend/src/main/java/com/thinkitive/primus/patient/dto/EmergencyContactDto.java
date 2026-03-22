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
public class EmergencyContactDto {

    private Long id;
    private Long patientId;
    private String name;
    private String relationship;
    private String phone;
    private String email;
    private boolean isPrimary;
    private Instant createdAt;
    private Instant modifiedAt;
}
