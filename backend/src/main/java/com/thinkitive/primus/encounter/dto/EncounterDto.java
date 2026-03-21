package com.thinkitive.primus.encounter.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class EncounterDto {

    private UUID uuid;
    private UUID patientUuid;
    private String patientName;
    private UUID appointmentUuid;
    private String providerId;
    private String providerName;
    private String encounterType;
    private String status; // DRAFT | IN_PROGRESS | SIGNED | AMENDED
    private String chiefComplaint;

    // SOAP note
    private String subjective;
    private String objective;
    private String assessment;
    private String plan;

    private List<String> diagnosisCodes;
    private List<String> procedureCodes;

    private Instant signedAt;
    private String signedBy;
    private Instant createdAt;
    private Instant modifiedAt;

    private List<AddendumDto> addenda;
}
