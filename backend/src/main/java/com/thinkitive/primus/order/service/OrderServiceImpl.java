package com.thinkitive.primus.order.service;

import com.thinkitive.primus.order.dto.*;
import com.thinkitive.primus.order.entity.LabOrder;
import com.thinkitive.primus.order.entity.LabOrder.LabOrderStatus;
import com.thinkitive.primus.order.entity.LabOrder.LabPriority;
import com.thinkitive.primus.order.entity.LabResult;
import com.thinkitive.primus.order.entity.LabResult.LabResultStatus;
import com.thinkitive.primus.order.entity.Referral;
import com.thinkitive.primus.order.entity.Referral.ReferralStatus;
import com.thinkitive.primus.order.entity.Referral.ReferralUrgency;
import com.thinkitive.primus.order.repository.LabOrderRepository;
import com.thinkitive.primus.order.repository.LabResultRepository;
import com.thinkitive.primus.order.repository.ReferralRepository;
import com.thinkitive.primus.patient.entity.Patient;
import com.thinkitive.primus.patient.repository.PatientRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    // Phase 1: replace with real provider lookup from JWT claims via ProviderRepository
    private static final long UNRESOLVED_PROVIDER_ID = 0L;

    private final LabOrderRepository labOrderRepository;
    private final LabResultRepository labResultRepository;
    private final ReferralRepository referralRepository;
    private final PatientRepository patientRepository;

    // ── Lab orders ────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public OrderDto createLabOrder(LabOrderRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating lab order tenant={} patient={} tests={}", tenantId, request.getPatientUuid(), request.getTests());

        Patient patient = requirePatient(tenantId, request.getPatientUuid());

        LabOrder order = LabOrder.builder()
                .tenantId(tenantId)
                .patientId(patient.getId())
                .providerId(resolveCurrentProviderId())
                .facility(request.getLab())
                .priority(parsePriority(request.getPriority()))
                .status(LabOrderStatus.PENDING)
                .orderedAt(Instant.now())
                .indication(request.getIcd10Code())
                .build();

        LabOrder saved = labOrderRepository.save(order);
        log.info("Lab order created id={} uuid={}", saved.getId(), saved.getUuid());
        return toLabOrderDto(saved, patient, request.getTests(), request.isFasting(), request.getNotes());
    }

    @Override
    @Transactional
    public OrderDto createImagingOrder(ImagingOrderRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating imaging order tenant={} patient={} modality={}", tenantId, request.getPatientUuid(), request.getModality());

        Patient patient = requirePatient(tenantId, request.getPatientUuid());

        // Imaging orders reuse the LabOrder entity; facility encodes the modality + body part.
        // Phase 4: introduce a dedicated ImagingOrder entity when HL7 integration is implemented.
        String facilityDescriptor = request.getModality()
                + (request.getBodyPart() != null ? ":" + request.getBodyPart() : "")
                + (request.getLaterality() != null ? ":" + request.getLaterality() : "");

        LabOrder order = LabOrder.builder()
                .tenantId(tenantId)
                .patientId(patient.getId())
                .providerId(resolveCurrentProviderId())
                .facility(facilityDescriptor)
                .priority(parsePriority(request.getPriority()))
                .status(LabOrderStatus.PENDING)
                .orderedAt(Instant.now())
                .indication(request.getIcd10Code())
                .build();

        LabOrder saved = labOrderRepository.save(order);
        log.info("Imaging order created id={} uuid={}", saved.getId(), saved.getUuid());
        return toImagingOrderDto(saved, patient, request);
    }

    // ── Referrals ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public OrderDto createReferral(ReferralRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating referral tenant={} patient={} specialty={}", tenantId, request.getPatientUuid(), request.getSpecialtyType());

        Patient patient = requirePatient(tenantId, request.getPatientUuid());

        Referral referral = Referral.builder()
                .tenantId(tenantId)
                .patientId(patient.getId())
                .referringProviderId(resolveCurrentProviderId())
                .specialty(request.getSpecialtyType())
                .referredTo(request.getReferredProviderName())
                .urgency(parseUrgency(request.getPriority()))
                .reason(request.getClinicalReason())
                .clinicalNotes(request.getNotes())
                .status(ReferralStatus.DRAFT)
                .build();

        Referral saved = referralRepository.save(referral);
        log.info("Referral created id={} uuid={}", saved.getId(), saved.getUuid());
        return toReferralDto(saved, patient, request);
    }

    // ── Retrieval ─────────────────────────────────────────────────────────────

    @Override
    public OrderDto getOrder(String uuid) {
        Long tenantId = TenantContext.getTenantId();

        // Try LabOrder first, then Referral.
        // Phase 4: add findByTenantIdAndUuid to LabOrderRepository and ReferralRepository.
        LabOrder labOrder = labOrderRepository
                .findByTenantIdAndStatus(tenantId, LabOrderStatus.PENDING)
                .stream()
                .filter(o -> o.getUuid().equals(uuid) && !o.isArchive())
                .findFirst()
                .orElse(null);

        if (labOrder != null) {
            Patient patient = requirePatientById(labOrder.getPatientId());
            return toLabOrderDto(labOrder, patient, List.of(), false, null);
        }

        Referral referral = referralRepository
                .findByTenantIdAndStatus(tenantId, ReferralStatus.DRAFT)
                .stream()
                .filter(r -> r.getUuid().equals(uuid) && !r.isArchive())
                .findFirst()
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND, "Order not found: " + uuid));

        Patient patient = requirePatientById(referral.getPatientId());
        return toReferralDto(referral, patient, null);
    }

    @Override
    public List<OrderDto> getOrdersByPatient(String patientUuid) {
        Long tenantId = TenantContext.getTenantId();
        Patient patient = requirePatient(tenantId, patientUuid);

        List<OrderDto> results = new ArrayList<>();

        // Lab + Imaging orders
        labOrderRepository
                .findByTenantIdAndPatientIdOrderByOrderedAtDesc(
                        tenantId, patient.getId(), PageRequest.of(0, 200))
                .getContent()
                .stream()
                .filter(o -> !o.isArchive())
                .map(o -> toLabOrderDto(o, patient, List.of(), false, null))
                .forEach(results::add);

        // Referrals
        referralRepository
                .findByPatientIdAndArchiveFalse(patient.getId())
                .stream()
                .map(r -> toReferralDto(r, patient, null))
                .forEach(results::add);

        return results;
    }

    // ── Lab results ───────────────────────────────────────────────────────────

    @Override
    @Transactional
    public OrderDto receiveLabResult(String orderUuid, LabResultRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Receiving lab result for order={}", orderUuid);

        // Phase 4: add findByTenantIdAndUuid to LabOrderRepository
        LabOrder order = labOrderRepository
                .findByTenantIdAndStatus(tenantId, LabOrderStatus.PENDING)
                .stream()
                .filter(o -> o.getUuid().equals(orderUuid) && !o.isArchive())
                .findFirst()
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Lab order not found: " + orderUuid));

        // Persist one LabResult row per component
        if (request.getComponents() != null) {
            List<LabResult> resultRows = request.getComponents().stream()
                    .map(c -> (LabResult) LabResult.builder()
                            .tenantId(tenantId)
                            .orderId(order.getId())
                            .patientId(order.getPatientId())
                            .loincCode(c.getLoincCode())
                            .testName(c.getTestName())
                            .value(c.getValue())
                            .unit(c.getUnit())
                            .referenceRange(c.getReferenceRange())
                            .status(parseResultStatus(c.getFlag()))
                            .resultDate(Instant.now())
                            .build())
                    .toList();
            labResultRepository.saveAll(resultRows);
        }

        order.setStatus(LabOrderStatus.RESULTED);
        order.setResultedAt(request.getResultedAt());
        LabOrder saved = labOrderRepository.save(order);

        Patient patient = requirePatientById(saved.getPatientId());
        log.info("Lab order {} resulted — {} components stored", orderUuid,
                request.getComponents() != null ? request.getComponents().size() : 0);
        return toLabOrderDto(saved, patient, List.of(), false, null);
    }

    @Override
    @Transactional
    public OrderDto reviewResult(String orderUuid, OrderReviewRequest request) {
        Long tenantId = TenantContext.getTenantId();

        // Phase 4: add findByTenantIdAndUuid to LabOrderRepository
        LabOrder order = labOrderRepository
                .findByTenantIdAndStatus(tenantId, LabOrderStatus.RESULTED)
                .stream()
                .filter(o -> o.getUuid().equals(orderUuid) && !o.isArchive())
                .findFirst()
                .orElseThrow(() -> new PrimusException(ResponseCode.BAD_REQUEST,
                        "Order not found or has not been resulted yet: " + orderUuid));

        // Mark all result components as reviewed
        String reviewer = currentAuditor();
        Instant reviewedAt = Instant.now();
        List<LabResult> results = labResultRepository.findByOrderId(order.getId());
        results.forEach(r -> {
            r.setReviewedBy(reviewer);
            r.setReviewedAt(reviewedAt);
        });
        labResultRepository.saveAll(results);

        order.setStatus(LabOrderStatus.REVIEWED);
        LabOrder saved = labOrderRepository.save(order);

        Patient patient = requirePatientById(saved.getPatientId());
        log.info("Order {} reviewed by={} followUp={} patientNotified={}",
                orderUuid, reviewer, request.getFollowUpAction(), request.isPatientNotified());
        return toLabOrderDto(saved, patient, List.of(), false, null);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

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

    private LabPriority parsePriority(String priority) {
        if (priority == null) return LabPriority.ROUTINE;
        try {
            return LabPriority.valueOf(priority.toUpperCase());
        } catch (IllegalArgumentException ignored) {
            log.warn("Unknown priority '{}', defaulting to ROUTINE", priority);
            return LabPriority.ROUTINE;
        }
    }

    private ReferralUrgency parseUrgency(String priority) {
        if (priority == null) return ReferralUrgency.ROUTINE;
        return switch (priority.toUpperCase()) {
            case "STAT", "EMERGENT" -> ReferralUrgency.EMERGENT;
            case "URGENT"           -> ReferralUrgency.URGENT;
            default                 -> ReferralUrgency.ROUTINE;
        };
    }

    private LabResultStatus parseResultStatus(String flag) {
        if (flag == null) return LabResultStatus.PENDING;
        try {
            return LabResultStatus.valueOf(flag.toUpperCase());
        } catch (IllegalArgumentException ignored) {
            log.warn("Unknown result flag '{}', defaulting to PENDING", flag);
            return LabResultStatus.PENDING;
        }
    }

    /**
     * Returns the current provider's Long ID.
     * Phase 1: resolve from JWT claims via ProviderRepository once the provider domain exists.
     */
    private Long resolveCurrentProviderId() {
        return UNRESOLVED_PROVIDER_ID;
    }

    private String currentAuditor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return "system";
    }

    // ── DTO mapping ───────────────────────────────────────────────────────────

    private OrderDto toLabOrderDto(LabOrder o, Patient patient,
                                   List<String> tests, boolean fasting, String notes) {
        return OrderDto.builder()
                .uuid(o.getUuid())
                .orderType(isImagingFacility(o.getFacility()) ? "IMAGING" : "LAB")
                .patientUuid(patient.getUuid())
                .patientName(patient.getFirstName() + " " + patient.getLastName())
                .status(o.getStatus() != null ? o.getStatus().name() : null)
                .priority(o.getPriority() != null ? o.getPriority().name() : null)
                .lab(o.getFacility())
                .tests(tests)
                .fasting(fasting)
                .icd10Code(o.getIndication())
                .notes(notes)
                .orderedAt(o.getOrderedAt())
                .resultedAt(o.getResultedAt())
                .build();
    }

    private OrderDto toImagingOrderDto(LabOrder o, Patient patient, ImagingOrderRequest request) {
        return OrderDto.builder()
                .uuid(o.getUuid())
                .orderType("IMAGING")
                .patientUuid(patient.getUuid())
                .patientName(patient.getFirstName() + " " + patient.getLastName())
                .status(o.getStatus() != null ? o.getStatus().name() : null)
                .priority(o.getPriority() != null ? o.getPriority().name() : null)
                .modality(request.getModality())
                .bodyPart(request.getBodyPart())
                .laterality(request.getLaterality())
                .icd10Code(request.getIcd10Code())
                .notes(request.getNotes())
                .orderedAt(o.getOrderedAt())
                .build();
    }

    private OrderDto toReferralDto(Referral r, Patient patient, ReferralRequest request) {
        return OrderDto.builder()
                .uuid(r.getUuid())
                .orderType("REFERRAL")
                .patientUuid(patient.getUuid())
                .patientName(patient.getFirstName() + " " + patient.getLastName())
                .status(r.getStatus() != null ? r.getStatus().name() : null)
                .priority(r.getUrgency() != null ? r.getUrgency().name() : null)
                .specialtyType(r.getSpecialty())
                .referredProviderName(r.getReferredTo())
                .referredProviderNpi(request != null ? request.getReferredProviderNpi() : null)
                .icd10Code(r.getReason())
                .notes(r.getClinicalNotes())
                .orderedAt(r.getCreatedAt())
                .build();
    }

    /**
     * Heuristic: if the facility string contains a colon it was stored as "MODALITY:BODYPART"
     * by createImagingOrder, not a plain lab name.
     */
    private boolean isImagingFacility(String facility) {
        return facility != null && facility.contains(":");
    }
}
