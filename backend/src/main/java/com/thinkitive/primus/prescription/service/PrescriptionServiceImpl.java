package com.thinkitive.primus.prescription.service;

import com.thinkitive.primus.prescription.dto.*;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Phase-0 stub. Phase 5: integrate ScriptSure EPCS for e-prescribing.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PrescriptionServiceImpl implements PrescriptionService {

    @Override
    @Transactional
    public PrescriptionDto createPrescription(CreatePrescriptionRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating prescription tenant={} drug={} patient={}", tenantId, request.getDrugName(), request.getPatientUuid());
        return PrescriptionDto.builder()
                .uuid(UUID.randomUUID())
                .patientUuid(request.getPatientUuid())
                .patientName("James Anderson")
                .encounterUuid(request.getEncounterUuid())
                .prescriberId("PRV-00001")
                .prescriberName("Dr. Sarah Mitchell")
                .drugName(request.getDrugName())
                .ndcCode(request.getNdcCode())
                .strength(request.getStrength())
                .dosageForm(request.getDosageForm())
                .route(request.getRoute())
                .sig(request.getSig())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .refills(request.getRefills() != null ? request.getRefills() : 0)
                .refillsRemaining(request.getRefills() != null ? request.getRefills() : 0)
                .daw(request.isDaw())
                .diagnosisCode(request.getDiagnosisCode())
                .pharmacyId(request.getPharmacyId())
                .controlled(request.isControlled())
                .deaSchedule(request.getDeaSchedule())
                .notes(request.getNotes())
                .status("PENDING")
                .prescribedAt(Instant.now())
                .build();
    }

    @Override
    public PrescriptionDto getPrescription(UUID uuid) {
        return buildMockPrescription(uuid, "PENDING");
    }

    @Override
    public List<PrescriptionDto> getPrescriptionsByPatient(UUID patientUuid) {
        return List.of(
                buildMockPrescription(UUID.randomUUID(), "FILLED"),
                buildMockPrescription(UUID.randomUUID(), "SENT")
        );
    }

    @Override
    @Transactional
    public PrescriptionDto sendToPharmacy(UUID uuid) {
        PrescriptionDto rx = getPrescription(uuid);
        if ("CANCELLED".equals(rx.getStatus())) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Cannot send a cancelled prescription");
        }
        if ("SENT".equals(rx.getStatus()) || "FILLED".equals(rx.getStatus())) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Prescription already sent to pharmacy");
        }
        // Phase 5: call ScriptSure EPCS API here
        rx.setStatus("SENT");
        rx.setSentAt(Instant.now());
        log.info("Prescription {} sent to pharmacy via ScriptSure (mock)", uuid);
        return rx;
    }

    @Override
    @Transactional
    public PrescriptionDto cancelPrescription(UUID uuid) {
        PrescriptionDto rx = getPrescription(uuid);
        if ("CANCELLED".equals(rx.getStatus())) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Prescription is already cancelled");
        }
        if ("FILLED".equals(rx.getStatus())) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Prescription has already been filled");
        }
        rx.setStatus("CANCELLED");
        rx.setCancelledAt(Instant.now());
        return rx;
    }

    @Override
    public InteractionResult checkInteractions(InteractionCheckRequest request) {
        // Phase 5: call ScriptSure or DrFirst interaction checking API
        // Mock: return a sample moderate interaction for demo
        if (request.getNdcCodes().size() >= 2) {
            return InteractionResult.builder()
                    .hasInteractions(true)
                    .interactions(List.of(
                            InteractionResult.Interaction.builder()
                                    .drug1(request.getNdcCodes().get(0))
                                    .drug2(request.getNdcCodes().get(1))
                                    .severity("MODERATE")
                                    .description("Concurrent use may increase bleeding risk.")
                                    .recommendation("Monitor patient for signs of bleeding.")
                                    .build()
                    ))
                    .build();
        }
        return InteractionResult.builder().hasInteractions(false).interactions(List.of()).build();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private PrescriptionDto buildMockPrescription(UUID uuid, String status) {
        return PrescriptionDto.builder()
                .uuid(uuid)
                .patientUuid(UUID.fromString("aaaaaaaa-0000-0000-0000-000000000001"))
                .patientName("James Anderson")
                .prescriberId("PRV-00001")
                .prescriberName("Dr. Sarah Mitchell")
                .drugName("Lisinopril")
                .strength("10mg")
                .dosageForm("TABLET")
                .route("ORAL")
                .sig("Take 1 tablet by mouth once daily")
                .quantity(30)
                .unit("TABLETS")
                .refills(1)
                .refillsRemaining(1)
                .status(status)
                .prescribedAt(Instant.now().minusSeconds(86400))
                .build();
    }
}
