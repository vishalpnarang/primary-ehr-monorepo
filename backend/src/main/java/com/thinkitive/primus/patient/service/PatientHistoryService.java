package com.thinkitive.primus.patient.service;

import com.thinkitive.primus.patient.dto.*;
import com.thinkitive.primus.patient.entity.*;

import java.util.List;

public interface PatientHistoryService {

    // ── Family History ────────────────────────────────────────────────────────

    List<FamilyHistory> getFamilyHistory(Long patientId, Long tenantId);

    FamilyHistory addFamilyHistory(Long patientId, FamilyHistoryRequest request, Long tenantId);

    // ── Social History ────────────────────────────────────────────────────────

    SocialHistory getSocialHistory(Long patientId, Long tenantId);

    SocialHistory saveSocialHistory(Long patientId, SocialHistoryRequest request, Long tenantId);

    // ── Past Surgical History ─────────────────────────────────────────────────

    List<PastSurgicalHistory> getPastSurgicalHistory(Long patientId, Long tenantId);

    PastSurgicalHistory addPastSurgicalHistory(Long patientId, PastSurgicalHistoryRequest request, Long tenantId);

    // ── Past Medical History ──────────────────────────────────────────────────

    List<PastMedicalHistory> getPastMedicalHistory(Long patientId, Long tenantId);

    PastMedicalHistory addPastMedicalHistory(Long patientId, PastMedicalHistoryRequest request, Long tenantId);

    // ── Emergency Contacts ────────────────────────────────────────────────────

    List<EmergencyContact> getEmergencyContacts(Long patientId, Long tenantId);

    EmergencyContact addEmergencyContact(Long patientId, EmergencyContactRequest request, Long tenantId);

    // ── Patient Flags ─────────────────────────────────────────────────────────

    List<PatientFlag> getPatientFlags(Long patientId, Long tenantId);

    PatientFlag addPatientFlag(Long patientId, PatientFlagRequest request, Long tenantId);

    // ── Soft Delete ───────────────────────────────────────────────────────────

    /**
     * Soft-delete any history record by its primary-key ID.
     * Sets archive = true on the underlying row.
     */
    void deleteRecord(Long id, Long tenantId);
}
