package com.thinkitive.primus.patient.service;

import com.thinkitive.primus.patient.dto.*;
import com.thinkitive.primus.patient.entity.*;

import java.util.List;

public interface DirectoryService {

    // ── Pharmacies ────────────────────────────────────────────────────────────

    List<Pharmacy> getPharmacies(Long tenantId);

    Pharmacy createPharmacy(PharmacyRequest request, Long tenantId);

    // ── Contacts ──────────────────────────────────────────────────────────────

    List<Contact> getContacts(String type, Long tenantId);

    Contact createContact(ContactRequest request, Long tenantId);

    // ── Patient–Pharmacy Link ─────────────────────────────────────────────────

    PatientLinkedPharmacy linkPharmacy(Long patientId, Long pharmacyId, boolean preferred, Long tenantId);

    List<PatientLinkedPharmacy> getPatientPharmacies(Long patientId, Long tenantId);
}
