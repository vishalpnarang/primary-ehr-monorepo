package com.thinkitive.primus.order.service;

import com.thinkitive.primus.order.dto.*;
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
 * Phase-0 stub. Phase 4: integrate Quest HL7 adapter, real order persistence.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    @Override
    @Transactional
    public OrderDto createLabOrder(LabOrderRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating lab order tenant={} patient={} tests={}", tenantId, request.getPatientUuid(), request.getTests());
        return OrderDto.builder()
                .uuid(UUID.randomUUID())
                .orderType("LAB")
                .patientUuid(request.getPatientUuid())
                .patientName("James Anderson")
                .encounterUuid(request.getEncounterUuid())
                .orderingProviderId("PRV-00001")
                .orderingProviderName("Dr. Sarah Mitchell")
                .lab(request.getLab())
                .tests(request.getTests())
                .fasting(request.isFasting())
                .icd10Code(request.getIcd10Code())
                .priority(request.getPriority() != null ? request.getPriority() : "ROUTINE")
                .notes(request.getNotes())
                .status("PENDING")
                .orderedAt(Instant.now())
                .build();
    }

    @Override
    @Transactional
    public OrderDto createImagingOrder(ImagingOrderRequest request) {
        log.info("Creating imaging order patient={} modality={}", request.getPatientUuid(), request.getModality());
        return OrderDto.builder()
                .uuid(UUID.randomUUID())
                .orderType("IMAGING")
                .patientUuid(request.getPatientUuid())
                .patientName("James Anderson")
                .encounterUuid(request.getEncounterUuid())
                .orderingProviderId("PRV-00001")
                .orderingProviderName("Dr. Sarah Mitchell")
                .modality(request.getModality())
                .bodyPart(request.getBodyPart())
                .laterality(request.getLaterality())
                .icd10Code(request.getIcd10Code())
                .priority(request.getPriority() != null ? request.getPriority() : "ROUTINE")
                .status("PENDING")
                .orderedAt(Instant.now())
                .build();
    }

    @Override
    @Transactional
    public OrderDto createReferral(ReferralRequest request) {
        log.info("Creating referral patient={} specialty={}", request.getPatientUuid(), request.getSpecialtyType());
        return OrderDto.builder()
                .uuid(UUID.randomUUID())
                .orderType("REFERRAL")
                .patientUuid(request.getPatientUuid())
                .patientName("James Anderson")
                .encounterUuid(request.getEncounterUuid())
                .orderingProviderId("PRV-00001")
                .orderingProviderName("Dr. Sarah Mitchell")
                .specialtyType(request.getSpecialtyType())
                .referredProviderName(request.getReferredProviderName())
                .referredProviderNpi(request.getReferredProviderNpi())
                .icd10Code(request.getIcd10Code())
                .notes(request.getClinicalReason())
                .priority(request.getPriority() != null ? request.getPriority() : "ROUTINE")
                .status("PENDING")
                .orderedAt(Instant.now())
                .build();
    }

    @Override
    public OrderDto getOrder(UUID uuid) {
        return buildMockOrder(uuid);
    }

    @Override
    public List<OrderDto> getOrdersByPatient(UUID patientUuid) {
        return List.of(buildMockOrder(UUID.randomUUID()), buildMockOrder(UUID.randomUUID()));
    }

    @Override
    @Transactional
    public OrderDto receiveLabResult(UUID orderUuid, LabResultRequest request) {
        log.info("Receiving lab result for order={}", orderUuid);
        // Phase 4: parse HL7 result, store components, trigger inbox notification
        OrderDto order = getOrder(orderUuid);
        order.setStatus("RESULTED");
        order.setResultedAt(request.getResultedAt());
        return order;
    }

    @Override
    @Transactional
    public OrderDto reviewResult(UUID orderUuid, OrderReviewRequest request) {
        OrderDto order = getOrder(orderUuid);
        if (!"RESULTED".equals(order.getStatus())) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Order has not been resulted yet");
        }
        order.setStatus("REVIEWED");
        log.info("Order {} reviewed — followUp={} patientNotified={}", orderUuid, request.getFollowUpAction(), request.isPatientNotified());
        return order;
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private OrderDto buildMockOrder(UUID uuid) {
        return OrderDto.builder()
                .uuid(uuid)
                .orderType("LAB")
                .patientUuid(UUID.fromString("aaaaaaaa-0000-0000-0000-000000000001"))
                .patientName("James Anderson")
                .encounterUuid(UUID.randomUUID())
                .orderingProviderId("PRV-00001")
                .orderingProviderName("Dr. Sarah Mitchell")
                .lab("QUEST")
                .tests(List.of("58410-2", "2093-3")) // CBC, Cholesterol
                .priority("ROUTINE")
                .status("PENDING")
                .orderedAt(Instant.now().minusSeconds(3600))
                .build();
    }
}
