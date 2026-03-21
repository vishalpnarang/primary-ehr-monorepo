package com.thinkitive.primus.billing.service;

import com.thinkitive.primus.billing.dto.*;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Phase-0 stub. Phase 6: integrate Availity clearinghouse + Stripe payments.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BillingServiceImpl implements BillingService {

    @Override
    public Page<ClaimDto> listClaims(String status, Pageable pageable) {
        List<ClaimDto> list = List.of(
                buildMockClaim(UUID.randomUUID(), "SUBMITTED"),
                buildMockClaim(UUID.randomUUID(), "PAID")
        );
        return new PageImpl<>(list, pageable, list.size());
    }

    @Override
    public ClaimDto getClaim(UUID uuid) {
        return buildMockClaim(uuid, "SUBMITTED");
    }

    @Override
    @Transactional
    public ClaimDto submitClaim(UUID uuid) {
        ClaimDto claim = getClaim(uuid);
        if ("SUBMITTED".equals(claim.getStatus()) || "PAID".equals(claim.getStatus())) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Claim is already submitted or paid");
        }
        // Phase 6: transmit 837P EDI to Availity clearinghouse
        claim.setStatus("SUBMITTED");
        claim.setSubmittedAt(Instant.now());
        log.info("Claim {} submitted to Availity (mock)", uuid);
        return claim;
    }

    @Override
    @Transactional
    public ClaimDto denyClaim(UUID uuid, ClaimDenyRequest request) {
        ClaimDto claim = getClaim(uuid);
        claim.setStatus("DENIED");
        claim.setDenialCode(request.getDenialCode());
        claim.setDenialReason(request.getDenialReason());
        claim.setUpdatedAt(Instant.now());
        return claim;
    }

    @Override
    @Transactional
    public ClaimDto appealClaim(UUID uuid, ClaimAppealRequest request) {
        ClaimDto claim = getClaim(uuid);
        if (!"DENIED".equals(claim.getStatus())) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Only denied claims can be appealed");
        }
        claim.setStatus("APPEALED");
        claim.setUpdatedAt(Instant.now());
        log.info("Appeal filed for claim {} reason={}", uuid, request.getAppealReason());
        return claim;
    }

    @Override
    public BillingKpiDto getBillingKpi() {
        Long tenantId = TenantContext.getTenantId();
        return BillingKpiDto.builder()
                .totalCharges(new BigDecimal("285000.00"))
                .totalCollected(new BigDecimal("218450.00"))
                .totalAr(new BigDecimal("66550.00"))
                .cleanClaimRate(94.2)
                .denialRate(5.8)
                .collectionRate(76.6)
                .avgDaysToPayment(new BigDecimal("18.3"))
                .totalClaimsSubmitted(1240)
                .totalClaimsDenied(72)
                .totalClaimsAppealed(31)
                .build();
    }

    @Override
    @Transactional
    public PaymentDto recordPayment(PaymentRequest request) {
        log.info("Recording payment claimUuid={} amount={}", request.getClaimUuid(), request.getAmount());
        return PaymentDto.builder()
                .uuid(UUID.randomUUID())
                .claimUuid(request.getClaimUuid())
                .amount(request.getAmount())
                .paymentDate(request.getPaymentDate())
                .paymentMethod(request.getPaymentMethod())
                .referenceNumber(request.getReferenceNumber())
                .recordedAt(Instant.now())
                .build();
    }

    @Override
    public PatientBalanceDto getPatientBalance(UUID patientUuid) {
        return PatientBalanceDto.builder()
                .patientUuid(patientUuid)
                .patientName("James Anderson")
                .currentBalance(new BigDecimal("125.00"))
                .overdueBalance(new BigDecimal("0.00"))
                .overduedays(0)
                .build();
    }

    @Override
    public ArAgingDto getArAging() {
        return ArAgingDto.builder()
                .current(new BigDecimal("28400.00"))
                .days31to60(new BigDecimal("18200.00"))
                .days61to90(new BigDecimal("9800.00"))
                .days91to120(new BigDecimal("6100.00"))
                .over120(new BigDecimal("4050.00"))
                .total(new BigDecimal("66550.00"))
                .build();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private ClaimDto buildMockClaim(UUID uuid, String status) {
        return ClaimDto.builder()
                .uuid(uuid)
                .claimNumber("CLM-" + uuid.toString().substring(0, 8).toUpperCase())
                .patientUuid(UUID.fromString("aaaaaaaa-0000-0000-0000-000000000001"))
                .patientName("James Anderson")
                .encounterUuid(UUID.randomUUID())
                .providerId("PRV-00001")
                .providerName("Dr. Sarah Mitchell")
                .insurancePlanName("BlueCross BlueShield PPO")
                .insuranceMemberId("MBR-12345678")
                .serviceDate(LocalDate.now().minusDays(7))
                .lines(List.of(
                        ClaimLineDto.builder()
                                .cptCode("99395")
                                .icd10Code("Z00.00")
                                .units(1)
                                .unitCharge(new BigDecimal("250.00"))
                                .totalCharge(new BigDecimal("250.00"))
                                .build()
                ))
                .totalCharges(new BigDecimal("250.00"))
                .allowedAmount(new BigDecimal("210.00"))
                .paidAmount("PAID".equals(status) ? new BigDecimal("168.00") : BigDecimal.ZERO)
                .patientResponsibility(new BigDecimal("42.00"))
                .status(status)
                .clearinghouse("AVAILITY")
                .submittedAt(Instant.now().minusSeconds(86400 * 3))
                .updatedAt(Instant.now())
                .build();
    }
}
