package com.thinkitive.primus.prescription.service;

import com.thinkitive.primus.patient.entity.Patient;
import com.thinkitive.primus.patient.repository.PatientRepository;
import com.thinkitive.primus.prescription.dto.*;
import com.thinkitive.primus.prescription.entity.Medication;
import com.thinkitive.primus.prescription.entity.Medication.MedicationStatus;
import com.thinkitive.primus.prescription.entity.Prescription;
import com.thinkitive.primus.prescription.entity.Prescription.PrescriptionStatus;
import com.thinkitive.primus.prescription.repository.MedicationRepository;
import com.thinkitive.primus.prescription.repository.PrescriptionRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PrescriptionServiceImpl implements PrescriptionService {

    // Phase 1: replace with a real provider lookup from JWT claims via ProviderRepository
    private static final long UNRESOLVED_PROVIDER_ID = 0L;

    private final PrescriptionRepository prescriptionRepository;
    private final MedicationRepository medicationRepository;
    private final PatientRepository patientRepository;

    // ── Write operations ──────────────────────────────────────────────────────

    @Override
    @Transactional
    public PrescriptionDto createPrescription(CreatePrescriptionRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating prescription tenant={} drug={} patient={}", tenantId, request.getDrugName(), request.getPatientUuid());

        Patient patient = requirePatient(tenantId, request.getPatientUuid());

        // 1. Create and persist the Medication record (the medication list entry)
        Medication medication = Medication.builder()
                .tenantId(tenantId)
                .patientId(patient.getId())
                .drugName(request.getDrugName())
                .strength(request.getStrength())
                .dosageForm(request.getDosageForm())
                .directions(request.getSig())
                .quantity(request.getQuantity())
                .refills(request.getRefills() != null ? request.getRefills() : 0)
                .prescribedBy(currentAuditor())
                .prescribedAt(Instant.now())
                .status(MedicationStatus.ACTIVE)
                .startDate(LocalDate.now())
                .isControlled(request.isControlled())
                .schedule(request.getDeaSchedule())
                .build();

        Medication savedMed = medicationRepository.save(medication);

        // 2. Create and persist the Prescription (the dispense event/order)
        Prescription prescription = Prescription.builder()
                .tenantId(tenantId)
                .patientId(patient.getId())
                .medicationId(savedMed.getId())
                .providerId(UNRESOLVED_PROVIDER_ID)
                .pharmacyId(request.getPharmacyId())
                .status(PrescriptionStatus.PENDING)
                .build();

        Prescription savedRx = prescriptionRepository.save(prescription);
        log.info("Prescription created id={} uuid={} medicationId={}", savedRx.getId(), savedRx.getUuid(), savedMed.getId());

        return toDto(savedRx, savedMed, patient);
    }

    @Override
    @Transactional
    public PrescriptionDto sendToPharmacy(String uuid) {
        Long tenantId = TenantContext.getTenantId();

        Prescription rx = requirePrescription(tenantId, uuid);

        if (rx.getStatus() == PrescriptionStatus.CANCELLED) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Cannot send a cancelled prescription.");
        }
        if (rx.getStatus() == PrescriptionStatus.SENT || rx.getStatus() == PrescriptionStatus.FILLED) {
            throw new PrimusException(ResponseCode.BAD_REQUEST,
                    "Prescription has already been sent to pharmacy (status=" + rx.getStatus() + ").");
        }

        rx.setStatus(PrescriptionStatus.SENT);
        rx.setSentAt(Instant.now());
        Prescription saved = prescriptionRepository.save(rx);

        Medication med = requireMedication(saved.getMedicationId());
        Patient patient = requirePatientById(saved.getPatientId());

        // Phase 5: call ScriptSure EPCS API here to transmit the prescription electronically
        log.info("Prescription {} sent to pharmacy — ScriptSure EPCS integration deferred to Phase 5", uuid);
        return toDto(saved, med, patient);
    }

    @Override
    @Transactional
    public PrescriptionDto cancelPrescription(String uuid) {
        Long tenantId = TenantContext.getTenantId();

        Prescription rx = requirePrescription(tenantId, uuid);

        if (rx.getStatus() == PrescriptionStatus.CANCELLED) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Prescription is already cancelled.");
        }
        if (rx.getStatus() == PrescriptionStatus.FILLED) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Prescription has already been filled and cannot be cancelled.");
        }

        rx.setStatus(PrescriptionStatus.CANCELLED);
        Prescription saved = prescriptionRepository.save(rx);

        // Also mark the medication as discontinued
        Medication med = requireMedication(saved.getMedicationId());
        med.setStatus(MedicationStatus.DISCONTINUED);
        med.setEndDate(LocalDate.now());
        medicationRepository.save(med);

        Patient patient = requirePatientById(saved.getPatientId());
        log.info("Prescription {} cancelled, medication {} discontinued", uuid, med.getUuid());
        return toDto(saved, med, patient);
    }

    // ── Read operations ───────────────────────────────────────────────────────

    @Override
    public PrescriptionDto getPrescription(String uuid) {
        Long tenantId = TenantContext.getTenantId();
        Prescription rx = requirePrescription(tenantId, uuid);
        Medication med = requireMedication(rx.getMedicationId());
        Patient patient = requirePatientById(rx.getPatientId());
        return toDto(rx, med, patient);
    }

    @Override
    public List<PrescriptionDto> getPrescriptionsByPatient(String patientUuid) {
        Long tenantId = TenantContext.getTenantId();
        Patient patient = requirePatient(tenantId, patientUuid);

        // Active medications for the patient, most recent prescriptions first
        return medicationRepository
                .findByPatientIdAndStatus(patient.getId(), MedicationStatus.ACTIVE)
                .stream()
                .filter(m -> !m.isArchive())
                .flatMap(m -> prescriptionRepository.findByMedicationId(m.getId())
                        .stream()
                        .filter(rx -> !rx.isArchive())
                        .map(rx -> toDto(rx, m, patient)))
                .toList();
    }

    @Override
    public InteractionResult checkInteractions(InteractionCheckRequest request) {
        // Phase 5: replace with ScriptSure or DrFirst drug interaction API call.
        // The API will accept NDC codes and return severity-graded interaction pairs.
        // Returning no interactions for now so the UI flow can proceed unblocked.
        log.debug("Drug interaction check called for patient={} codes={} — returning empty result (Phase 5 stub)",
                request.getPatientUuid(), request.getNdcCodes());
        return InteractionResult.builder()
                .hasInteractions(false)
                .interactions(List.of())
                .build();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Prescription requirePrescription(Long tenantId, String uuid) {
        // Phase 5: add findByTenantIdAndUuid to PrescriptionRepository to replace this scan.
        return prescriptionRepository
                .findByTenantIdAndProviderIdAndStatus(tenantId, UNRESOLVED_PROVIDER_ID, PrescriptionStatus.PENDING)
                .stream()
                .filter(rx -> rx.getUuid().equals(uuid) && !rx.isArchive())
                .findFirst()
                // Fallback: scan all statuses for this tenant
                .orElseGet(() -> prescriptionRepository.findAll()
                        .stream()
                        .filter(rx -> rx.getTenantId().equals(tenantId)
                                && rx.getUuid().equals(uuid)
                                && !rx.isArchive())
                        .findFirst()
                        .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                                "Prescription not found: " + uuid)));
    }

    private Medication requireMedication(Long medicationId) {
        return medicationRepository.findById(medicationId)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Medication not found for id: " + medicationId));
    }

    private Patient requirePatient(Long tenantId, String patientUuid) {
        return patientRepository.findByTenantIdAndUuid(tenantId, patientUuid)
                .orElseThrow(() -> new PrimusException(ResponseCode.PATIENT_NOT_FOUND,
                        "Patient not found: " + patientUuid));
    }

    private Patient requirePatientById(Long patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new PrimusException(ResponseCode.PATIENT_NOT_FOUND,
                        "Patient not found for id: " + patientId));
    }

    private String currentAuditor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return "system";
    }

    // ── DTO mapping ───────────────────────────────────────────────────────────

    private PrescriptionDto toDto(Prescription rx, Medication med, Patient patient) {
        return PrescriptionDto.builder()
                .uuid(rx.getUuid())
                .patientUuid(patient.getUuid())
                .patientName(patient.getFirstName() + " " + patient.getLastName())
                .drugName(med.getDrugName())
                .strength(med.getStrength())
                .dosageForm(med.getDosageForm())
                .sig(med.getDirections())
                .quantity(med.getQuantity())
                .refills(med.getRefills())
                .refillsRemaining(med.getRefills())   // Phase 5: track dispenses to decrement this
                .pharmacyId(rx.getPharmacyId())
                .pharmacyName(rx.getPharmacyName())
                .status(rx.getStatus() != null ? rx.getStatus().name() : null)
                .controlled(med.isControlled())
                .deaSchedule(med.getSchedule())
                .prescribedAt(med.getPrescribedAt())
                .sentAt(rx.getSentAt())
                .build();
    }
}
