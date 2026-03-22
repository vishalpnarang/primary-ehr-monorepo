package com.thinkitive.primus.patient.service;

import com.thinkitive.primus.patient.dto.*;
import com.thinkitive.primus.patient.entity.*;
import com.thinkitive.primus.patient.repository.*;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PatientHistoryServiceImpl implements PatientHistoryService {

    private final PatientRepository patientRepository;
    private final FamilyHistoryRepository familyHistoryRepository;
    private final SocialHistoryRepository socialHistoryRepository;
    private final PastSurgicalHistoryRepository pastSurgicalHistoryRepository;
    private final PastMedicalHistoryRepository pastMedicalHistoryRepository;
    private final EmergencyContactRepository emergencyContactRepository;
    private final PatientFlagRepository patientFlagRepository;

    // ── Family History ────────────────────────────────────────────────────────

    @Override
    public List<FamilyHistory> getFamilyHistory(Long patientId, Long tenantId) {
        validatePatientExists(patientId, tenantId);
        return familyHistoryRepository.findByPatientIdAndTenantIdAndArchiveFalse(patientId, tenantId);
    }

    @Override
    @Transactional
    public FamilyHistory addFamilyHistory(Long patientId, FamilyHistoryRequest request, Long tenantId) {
        validatePatientExists(patientId, tenantId);
        log.info("Adding family history for patientId={} tenant={}", patientId, tenantId);

        FamilyHistory entity = FamilyHistory.builder()
                .tenantId(tenantId)
                .patientId(patientId)
                .relationship(request.getRelationship())
                .condition(request.getCondition())
                .icd10Code(request.getIcd10Code())
                .onsetAge(request.getOnsetAge())
                .deceased(request.isDeceased())
                .notes(request.getNotes())
                .build();

        return familyHistoryRepository.save(entity);
    }

    // ── Social History ────────────────────────────────────────────────────────

    @Override
    public SocialHistory getSocialHistory(Long patientId, Long tenantId) {
        validatePatientExists(patientId, tenantId);
        return socialHistoryRepository.findByPatientIdAndTenantId(patientId, tenantId)
                .orElse(null);
    }

    @Override
    @Transactional
    public SocialHistory saveSocialHistory(Long patientId, SocialHistoryRequest request, Long tenantId) {
        validatePatientExists(patientId, tenantId);
        log.info("Saving social history for patientId={} tenant={}", patientId, tenantId);

        SocialHistory entity = socialHistoryRepository
                .findByPatientIdAndTenantId(patientId, tenantId)
                .orElseGet(() -> SocialHistory.builder()
                        .tenantId(tenantId)
                        .patientId(patientId)
                        .build());

        entity.setSmokingStatus(request.getSmokingStatus());
        entity.setAlcoholUse(request.getAlcoholUse());
        entity.setDrugUse(request.getDrugUse());
        entity.setExerciseFrequency(request.getExerciseFrequency());
        entity.setDiet(request.getDiet());
        entity.setOccupation(request.getOccupation());
        entity.setEducationLevel(request.getEducationLevel());
        entity.setMaritalStatus(request.getMaritalStatus());
        entity.setHousingStatus(request.getHousingStatus());
        entity.setNotes(request.getNotes());

        return socialHistoryRepository.save(entity);
    }

    // ── Past Surgical History ─────────────────────────────────────────────────

    @Override
    public List<PastSurgicalHistory> getPastSurgicalHistory(Long patientId, Long tenantId) {
        validatePatientExists(patientId, tenantId);
        return pastSurgicalHistoryRepository.findByPatientIdAndTenantIdAndArchiveFalse(patientId, tenantId);
    }

    @Override
    @Transactional
    public PastSurgicalHistory addPastSurgicalHistory(Long patientId, PastSurgicalHistoryRequest request, Long tenantId) {
        validatePatientExists(patientId, tenantId);
        log.info("Adding past surgical history for patientId={} tenant={}", patientId, tenantId);

        PastSurgicalHistory entity = PastSurgicalHistory.builder()
                .tenantId(tenantId)
                .patientId(patientId)
                .procedureName(request.getProcedureName())
                .procedureDate(request.getProcedureDate())
                .cptCode(request.getCptCode())
                .surgeon(request.getSurgeon())
                .facility(request.getFacility())
                .notes(request.getNotes())
                .build();

        return pastSurgicalHistoryRepository.save(entity);
    }

    // ── Past Medical History ──────────────────────────────────────────────────

    @Override
    public List<PastMedicalHistory> getPastMedicalHistory(Long patientId, Long tenantId) {
        validatePatientExists(patientId, tenantId);
        return pastMedicalHistoryRepository.findByPatientIdAndTenantIdAndArchiveFalse(patientId, tenantId);
    }

    @Override
    @Transactional
    public PastMedicalHistory addPastMedicalHistory(Long patientId, PastMedicalHistoryRequest request, Long tenantId) {
        validatePatientExists(patientId, tenantId);
        log.info("Adding past medical history for patientId={} tenant={}", patientId, tenantId);

        PastMedicalHistory.ConditionStatus status = parseConditionStatus(request.getStatus());

        PastMedicalHistory entity = PastMedicalHistory.builder()
                .tenantId(tenantId)
                .patientId(patientId)
                .condition(request.getCondition())
                .icd10Code(request.getIcd10Code())
                .onsetDate(request.getOnsetDate())
                .resolutionDate(request.getResolutionDate())
                .status(status)
                .notes(request.getNotes())
                .build();

        return pastMedicalHistoryRepository.save(entity);
    }

    // ── Emergency Contacts ────────────────────────────────────────────────────

    @Override
    public List<EmergencyContact> getEmergencyContacts(Long patientId, Long tenantId) {
        validatePatientExists(patientId, tenantId);
        return emergencyContactRepository.findByPatientIdAndTenantIdAndArchiveFalse(patientId, tenantId);
    }

    @Override
    @Transactional
    public EmergencyContact addEmergencyContact(Long patientId, EmergencyContactRequest request, Long tenantId) {
        validatePatientExists(patientId, tenantId);
        log.info("Adding emergency contact for patientId={} tenant={}", patientId, tenantId);

        EmergencyContact entity = EmergencyContact.builder()
                .tenantId(tenantId)
                .patientId(patientId)
                .name(request.getName())
                .relationship(request.getRelationship())
                .phone(request.getPhone())
                .email(request.getEmail())
                .isPrimary(request.isPrimary())
                .build();

        return emergencyContactRepository.save(entity);
    }

    // ── Patient Flags ─────────────────────────────────────────────────────────

    @Override
    public List<PatientFlag> getPatientFlags(Long patientId, Long tenantId) {
        validatePatientExists(patientId, tenantId);
        return patientFlagRepository.findByPatientIdAndTenantId(patientId, tenantId);
    }

    @Override
    @Transactional
    public PatientFlag addPatientFlag(Long patientId, PatientFlagRequest request, Long tenantId) {
        validatePatientExists(patientId, tenantId);
        log.info("Adding patient flag for patientId={} tenant={} type={}", patientId, tenantId, request.getFlagType());

        PatientFlag.FlagType flagType = parseFlagType(request.getFlagType());
        PatientFlag.FlagSeverity severity = parseFlagSeverity(request.getSeverity());

        PatientFlag entity = PatientFlag.builder()
                .tenantId(tenantId)
                .patientId(patientId)
                .flagType(flagType)
                .label(request.getLabel())
                .severity(severity)
                .active(true)
                .notes(request.getNotes())
                .build();

        return patientFlagRepository.save(entity);
    }

    // ── Soft Delete ───────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deleteRecord(Long id, Long tenantId) {
        log.info("Soft-deleting history record id={} tenant={}", id, tenantId);

        // Try each repository in order — first match wins.
        if (tryArchiveFamilyHistory(id, tenantId)) return;
        if (tryArchiveSurgicalHistory(id, tenantId)) return;
        if (tryArchiveMedicalHistory(id, tenantId)) return;
        if (tryArchiveEmergencyContact(id, tenantId)) return;
        if (tryArchivePatientFlag(id, tenantId)) return;

        throw new PrimusException(ResponseCode.NOT_FOUND, "No history record found with id=" + id);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void validatePatientExists(Long patientId, Long tenantId) {
        boolean exists = patientRepository.findById(patientId)
                .map(p -> p.getTenantId().equals(tenantId) && !p.isArchive())
                .orElse(false);
        if (!exists) {
            throw new PrimusException(ResponseCode.PATIENT_NOT_FOUND);
        }
    }

    private boolean tryArchiveFamilyHistory(Long id, Long tenantId) {
        return familyHistoryRepository.findById(id)
                .filter(e -> e.getTenantId().equals(tenantId))
                .map(e -> {
                    e.setArchive(true);
                    familyHistoryRepository.save(e);
                    return true;
                })
                .orElse(false);
    }

    private boolean tryArchiveSurgicalHistory(Long id, Long tenantId) {
        return pastSurgicalHistoryRepository.findById(id)
                .filter(e -> e.getTenantId().equals(tenantId))
                .map(e -> {
                    e.setArchive(true);
                    pastSurgicalHistoryRepository.save(e);
                    return true;
                })
                .orElse(false);
    }

    private boolean tryArchiveMedicalHistory(Long id, Long tenantId) {
        return pastMedicalHistoryRepository.findById(id)
                .filter(e -> e.getTenantId().equals(tenantId))
                .map(e -> {
                    e.setArchive(true);
                    pastMedicalHistoryRepository.save(e);
                    return true;
                })
                .orElse(false);
    }

    private boolean tryArchiveEmergencyContact(Long id, Long tenantId) {
        return emergencyContactRepository.findById(id)
                .filter(e -> e.getTenantId().equals(tenantId))
                .map(e -> {
                    e.setArchive(true);
                    emergencyContactRepository.save(e);
                    return true;
                })
                .orElse(false);
    }

    private boolean tryArchivePatientFlag(Long id, Long tenantId) {
        return patientFlagRepository.findById(id)
                .filter(e -> e.getTenantId().equals(tenantId))
                .map(e -> {
                    e.setArchive(true);
                    patientFlagRepository.save(e);
                    return true;
                })
                .orElse(false);
    }

    private PastMedicalHistory.ConditionStatus parseConditionStatus(String status) {
        if (status == null) return PastMedicalHistory.ConditionStatus.ACTIVE;
        try {
            return PastMedicalHistory.ConditionStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException ignored) {
            return PastMedicalHistory.ConditionStatus.ACTIVE;
        }
    }

    private PatientFlag.FlagType parseFlagType(String flagType) {
        try {
            return PatientFlag.FlagType.valueOf(flagType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Invalid flag type: " + flagType);
        }
    }

    private PatientFlag.FlagSeverity parseFlagSeverity(String severity) {
        if (severity == null) return null;
        try {
            return PatientFlag.FlagSeverity.valueOf(severity.toUpperCase());
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }
}
