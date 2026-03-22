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
public class DirectoryServiceImpl implements DirectoryService {

    private final PharmacyRepository pharmacyRepository;
    private final ContactRepository contactRepository;
    private final PatientLinkedPharmacyRepository patientLinkedPharmacyRepository;
    private final PatientRepository patientRepository;

    // ── Pharmacies ────────────────────────────────────────────────────────────

    @Override
    public List<Pharmacy> getPharmacies(Long tenantId) {
        return pharmacyRepository.findByTenantIdAndArchiveFalse(tenantId);
    }

    @Override
    @Transactional
    public Pharmacy createPharmacy(PharmacyRequest request, Long tenantId) {
        log.info("Creating pharmacy name={} tenant={}", request.getName(), tenantId);

        Pharmacy entity = Pharmacy.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .npi(request.getNpi())
                .ncpdpId(request.getNcpdpId())
                .phone(request.getPhone())
                .fax(request.getFax())
                .addressLine1(request.getAddressLine1())
                .city(request.getCity())
                .state(request.getState())
                .zip(request.getZip())
                .is24Hour(request.isTwentyFourHour())
                .build();

        return pharmacyRepository.save(entity);
    }

    // ── Contacts ──────────────────────────────────────────────────────────────

    @Override
    public List<Contact> getContacts(String type, Long tenantId) {
        if (type == null || type.isBlank()) {
            return contactRepository.findByTenantIdAndArchiveFalse(tenantId);
        }
        Contact.ContactType contactType = parseContactType(type);
        return contactRepository.findByTypeAndTenantIdAndArchiveFalse(contactType, tenantId);
    }

    @Override
    @Transactional
    public Contact createContact(ContactRequest request, Long tenantId) {
        log.info("Creating contact name={} type={} tenant={}", request.getName(), request.getType(), tenantId);

        Contact.ContactType contactType = parseContactType(request.getType());

        Contact entity = Contact.builder()
                .tenantId(tenantId)
                .type(contactType)
                .name(request.getName())
                .specialty(request.getSpecialty())
                .organization(request.getOrganization())
                .npi(request.getNpi())
                .phone(request.getPhone())
                .fax(request.getFax())
                .email(request.getEmail())
                .addressLine1(request.getAddressLine1())
                .city(request.getCity())
                .state(request.getState())
                .zip(request.getZip())
                .notes(request.getNotes())
                .build();

        return contactRepository.save(entity);
    }

    // ── Patient–Pharmacy Link ─────────────────────────────────────────────────

    @Override
    @Transactional
    public PatientLinkedPharmacy linkPharmacy(Long patientId, Long pharmacyId, boolean preferred, Long tenantId) {
        log.info("Linking pharmacy={} to patient={} preferred={} tenant={}", pharmacyId, patientId, preferred, tenantId);

        validatePatientExists(patientId, tenantId);
        validatePharmacyExists(pharmacyId, tenantId);

        if (patientLinkedPharmacyRepository.existsByPatientIdAndPharmacyId(patientId, pharmacyId)) {
            throw new PrimusException(ResponseCode.CONFLICT,
                    "Pharmacy " + pharmacyId + " is already linked to patient " + patientId);
        }

        PatientLinkedPharmacy link = PatientLinkedPharmacy.builder()
                .tenantId(tenantId)
                .patientId(patientId)
                .pharmacyId(pharmacyId)
                .isPreferred(preferred)
                .build();

        return patientLinkedPharmacyRepository.save(link);
    }

    @Override
    public List<PatientLinkedPharmacy> getPatientPharmacies(Long patientId, Long tenantId) {
        validatePatientExists(patientId, tenantId);
        return patientLinkedPharmacyRepository.findByPatientIdAndTenantId(patientId, tenantId);
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

    private void validatePharmacyExists(Long pharmacyId, Long tenantId) {
        boolean exists = pharmacyRepository.findById(pharmacyId)
                .map(p -> p.getTenantId().equals(tenantId) && !p.isArchive())
                .orElse(false);
        if (!exists) {
            throw new PrimusException(ResponseCode.NOT_FOUND, "Pharmacy not found: " + pharmacyId);
        }
    }

    private Contact.ContactType parseContactType(String type) {
        try {
            return Contact.ContactType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Invalid contact type: " + type);
        }
    }
}
