package com.thinkitive.primus.prescription.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class PrescriptionDto {

    private UUID uuid;
    private UUID patientUuid;
    private String patientName;
    private UUID encounterUuid;
    private String prescriberId;
    private String prescriberName;
    private String drugName;
    private String ndcCode;
    private String strength;
    private String dosageForm;
    private String route;
    private String sig;
    private Integer quantity;
    private String unit;
    private Integer refills;
    private Integer refillsRemaining;
    private boolean daw;
    private String diagnosisCode;
    private String pharmacyId;
    private String pharmacyName;
    private String status; // PENDING | SENT | FILLED | CANCELLED | EXPIRED
    private boolean controlled;
    private String deaSchedule;
    private String notes;
    private Instant prescribedAt;
    private Instant sentAt;
    private Instant cancelledAt;
}
