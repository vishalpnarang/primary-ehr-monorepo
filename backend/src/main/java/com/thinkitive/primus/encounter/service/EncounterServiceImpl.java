package com.thinkitive.primus.encounter.service;

import com.thinkitive.primus.encounter.dto.*;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Phase-0 stub. Phase 3: replace with JPA encounter + charge generation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EncounterServiceImpl implements EncounterService {

    @Override
    @Transactional
    public EncounterDto createEncounter(CreateEncounterRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating encounter tenant={} patient={}", tenantId, request.getPatientUuid());
        return EncounterDto.builder()
                .uuid(UUID.randomUUID())
                .patientUuid(request.getPatientUuid())
                .patientName("James Anderson")
                .appointmentUuid(request.getAppointmentUuid())
                .providerId(request.getProviderId())
                .providerName("Dr. Sarah Mitchell")
                .encounterType(request.getEncounterType() != null ? request.getEncounterType() : "OFFICE_VISIT")
                .status("DRAFT")
                .chiefComplaint(request.getChiefComplaint())
                .addenda(new ArrayList<>())
                .createdAt(Instant.now())
                .build();
    }

    @Override
    public EncounterDto getEncounter(UUID uuid) {
        return buildMockEncounter(uuid, "IN_PROGRESS");
    }

    @Override
    @Transactional
    public EncounterDto updateEncounter(UUID uuid, UpdateEncounterRequest request) {
        EncounterDto enc = getEncounter(uuid);
        if ("SIGNED".equals(enc.getStatus())) {
            throw new PrimusException(ResponseCode.ENCOUNTER_LOCKED, "Encounter is signed and cannot be modified. Use addendum.");
        }
        if (request.getSubjective()  != null) enc.setSubjective(request.getSubjective());
        if (request.getObjective()   != null) enc.setObjective(request.getObjective());
        if (request.getAssessment()  != null) enc.setAssessment(request.getAssessment());
        if (request.getPlan()        != null) enc.setPlan(request.getPlan());
        if (request.getDiagnosisCodes() != null) enc.setDiagnosisCodes(request.getDiagnosisCodes());
        if (request.getProcedureCodes() != null) enc.setProcedureCodes(request.getProcedureCodes());
        enc.setStatus("IN_PROGRESS");
        enc.setModifiedAt(Instant.now());
        return enc;
    }

    @Override
    @Transactional
    public EncounterDto signEncounter(UUID uuid) {
        EncounterDto enc = getEncounter(uuid);
        if ("SIGNED".equals(enc.getStatus())) {
            throw new PrimusException(ResponseCode.ENCOUNTER_LOCKED, "Encounter is already signed");
        }
        // Phase 3: trigger charge/claim generation here
        enc.setStatus("SIGNED");
        enc.setSignedAt(Instant.now());
        enc.setSignedBy("Dr. Sarah Mitchell");
        log.info("Encounter {} signed — charges will be generated", uuid);
        return enc;
    }

    @Override
    @Transactional
    public EncounterDto addAddendum(UUID uuid, AddendumRequest request) {
        EncounterDto enc = getEncounter(uuid);
        if (!"SIGNED".equals(enc.getStatus())) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Addenda can only be added to signed encounters");
        }
        AddendumDto addendum = AddendumDto.builder()
                .uuid(UUID.randomUUID())
                .encounterUuid(uuid)
                .text(request.getText())
                .addedBy("Dr. Sarah Mitchell")
                .addedAt(Instant.now())
                .build();
        enc.getAddenda().add(addendum);
        enc.setStatus("AMENDED");
        return enc;
    }

    @Override
    public List<EncounterDto> getEncountersByPatient(UUID patientUuid) {
        return List.of(
                buildMockEncounter(UUID.randomUUID(), "SIGNED"),
                buildMockEncounter(UUID.randomUUID(), "SIGNED")
        );
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private EncounterDto buildMockEncounter(UUID uuid, String status) {
        return EncounterDto.builder()
                .uuid(uuid)
                .patientUuid(UUID.fromString("aaaaaaaa-0000-0000-0000-000000000001"))
                .patientName("James Anderson")
                .appointmentUuid(UUID.randomUUID())
                .providerId("PRV-00001")
                .providerName("Dr. Sarah Mitchell")
                .encounterType("OFFICE_VISIT")
                .status(status)
                .chiefComplaint("Annual physical")
                .subjective("Patient presents for annual wellness visit. No acute complaints.")
                .objective("BP 120/80, HR 72, RR 16, Temp 98.6°F, O2 Sat 99%")
                .assessment("1. Annual wellness visit Z00.00\n2. Essential hypertension I10")
                .plan("Continue Lisinopril 10mg daily. Repeat BMP in 3 months.")
                .diagnosisCodes(List.of("Z00.00", "I10"))
                .procedureCodes(List.of("99395"))
                .addenda(new ArrayList<>())
                .createdAt(Instant.now().minusSeconds(7200))
                .modifiedAt(Instant.now().minusSeconds(3600))
                .build();
    }
}
