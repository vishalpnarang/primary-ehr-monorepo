package com.thinkitive.primus.billing.service;

import com.thinkitive.primus.billing.dto.*;
import com.thinkitive.primus.billing.entity.Claim;
import com.thinkitive.primus.billing.entity.Claim.ClaimStatus;
import com.thinkitive.primus.billing.entity.ClaimLine;
import com.thinkitive.primus.billing.entity.Payment;
import com.thinkitive.primus.billing.repository.ClaimLineRepository;
import com.thinkitive.primus.billing.repository.ClaimRepository;
import com.thinkitive.primus.billing.repository.PaymentRepository;
import com.thinkitive.primus.patient.entity.Patient;
import com.thinkitive.primus.patient.repository.PatientRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.OptionalDouble;
import java.util.UUID;

/**
 * Phase-6 implementation. Integrates Availity clearinghouse + Stripe payments in a later phase.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BillingServiceImpl implements BillingService {

    private final ClaimRepository     claimRepository;
    private final ClaimLineRepository claimLineRepository;
    private final PaymentRepository   paymentRepository;
    private final PatientRepository   patientRepository;

    // ── List / Get ────────────────────────────────────────────────────────────

    @Override
    public Page<ClaimDto> listClaims(String status, Pageable pageable) {
        Long tenantId = TenantContext.getTenantId();

        Page<Claim> page;
        if (status != null && !status.isBlank()) {
            ClaimStatus claimStatus = parseStatus(status);
            page = claimRepository.findByTenantIdAndStatus(tenantId, claimStatus, pageable);
        } else {
            page = claimRepository.findByTenantId(tenantId, pageable);
        }

        return page.map(this::toDto);
    }

    @Override
    public ClaimDto getClaim(UUID uuid) {
        Long tenantId = TenantContext.getTenantId();
        Claim claim = claimRepository.findByTenantIdAndUuid(tenantId, uuid)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND, "Claim not found: " + uuid));
        return toDtoWithLines(claim);
    }

    // ── State transitions ─────────────────────────────────────────────────────

    @Override
    @Transactional
    public ClaimDto submitClaim(UUID uuid) {
        Long tenantId = TenantContext.getTenantId();
        Claim claim = claimRepository.findByTenantIdAndUuid(tenantId, uuid)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND, "Claim not found: " + uuid));

        if (claim.getStatus() != ClaimStatus.READY) {
            throw new PrimusException(ResponseCode.BAD_REQUEST,
                    "Claim must be in READY status to submit. Current status: " + claim.getStatus());
        }

        claim.setStatus(ClaimStatus.SUBMITTED);
        claim.setSubmittedAt(Instant.now());
        claimRepository.save(claim);

        log.info("Claim {} submitted to Availity (Phase 6: EDI 837P)", uuid);
        return toDtoWithLines(claim);
    }

    @Override
    @Transactional
    public ClaimDto denyClaim(UUID uuid, ClaimDenyRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Claim claim = claimRepository.findByTenantIdAndUuid(tenantId, uuid)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND, "Claim not found: " + uuid));

        claim.setStatus(ClaimStatus.DENIED);
        claim.setDenialCode(request.getDenialCode());
        claim.setDenialReason(request.getDenialReason());
        claimRepository.save(claim);

        log.info("Claim {} denied code={}", uuid, request.getDenialCode());
        return toDtoWithLines(claim);
    }

    @Override
    @Transactional
    public ClaimDto appealClaim(UUID uuid, ClaimAppealRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Claim claim = claimRepository.findByTenantIdAndUuid(tenantId, uuid)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND, "Claim not found: " + uuid));

        if (claim.getStatus() != ClaimStatus.DENIED) {
            throw new PrimusException(ResponseCode.BAD_REQUEST,
                    "Only DENIED claims can be appealed. Current status: " + claim.getStatus());
        }

        claim.setStatus(ClaimStatus.APPEALED);
        claimRepository.save(claim);

        log.info("Appeal filed for claim {} reason={}", uuid, request.getAppealReason());
        return toDtoWithLines(claim);
    }

    // ── KPI ──────────────────────────────────────────────────────────────────

    @Override
    public BillingKpiDto getBillingKpi() {
        Long tenantId = TenantContext.getTenantId();
        List<Claim> allClaims = claimRepository.findByTenantId(tenantId);

        long total    = allClaims.size();
        long accepted = allClaims.stream().filter(c -> c.getStatus() == ClaimStatus.ACCEPTED).count();
        long paid     = allClaims.stream().filter(c -> c.getStatus() == ClaimStatus.PAID).count();
        long denied   = allClaims.stream().filter(c -> c.getStatus() == ClaimStatus.DENIED).count();
        long appealed = allClaims.stream().filter(c -> c.getStatus() == ClaimStatus.APPEALED).count();

        double cleanClaimRate = total > 0 ? (double) (accepted + paid) / total * 100 : 0.0;
        double denialRate     = total > 0 ? (double) denied / total * 100 : 0.0;

        // Average days in AR: mean days from dateOfService to now for unpaid claims
        OptionalDouble avgDaysOpt = allClaims.stream()
                .filter(c -> c.getStatus() != ClaimStatus.PAID && c.getDateOfService() != null)
                .mapToLong(c -> ChronoUnit.DAYS.between(c.getDateOfService(), LocalDate.now()))
                .average();
        BigDecimal avgDaysInAr = avgDaysOpt.isPresent()
                ? BigDecimal.valueOf(avgDaysOpt.getAsDouble()).setScale(1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Collections this week: sum payments created in last 7 days
        Instant weekAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        List<Payment> recentPayments = paymentRepository.findByTenantIdAndCreatedAtAfter(tenantId, weekAgo);
        BigDecimal collectionsThisWeek = recentPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCharges   = allClaims.stream()
                .map(c -> c.getTotalCharge() != null ? c.getTotalCharge() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCollected = allClaims.stream()
                .filter(c -> c.getPaidAmount() != null)
                .map(Claim::getPaidAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalAr = totalCharges.subtract(totalCollected);

        double collectionRate = totalCharges.compareTo(BigDecimal.ZERO) > 0
                ? totalCollected.divide(totalCharges, 4, RoundingMode.HALF_UP).doubleValue() * 100
                : 0.0;

        return BillingKpiDto.builder()
                .totalCharges(totalCharges)
                .totalCollected(totalCollected)
                .totalAr(totalAr)
                .cleanClaimRate(Math.round(cleanClaimRate * 10.0) / 10.0)
                .denialRate(Math.round(denialRate * 10.0) / 10.0)
                .collectionRate(Math.round(collectionRate * 10.0) / 10.0)
                .avgDaysToPayment(avgDaysInAr)
                .totalClaimsSubmitted((int) (allClaims.stream()
                        .filter(c -> c.getSubmittedAt() != null).count()))
                .totalClaimsDenied((int) denied)
                .totalClaimsAppealed((int) appealed)
                .build();
    }

    // ── Payment ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public PaymentDto recordPayment(PaymentRequest request) {
        Long tenantId = TenantContext.getTenantId();

        Claim claim = claimRepository.findByTenantIdAndUuid(tenantId, request.getClaimUuid())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Claim not found: " + request.getClaimUuid()));

        // Resolve payment method enum
        Payment.PaymentMethod method;
        try {
            String raw = request.getPaymentMethod() != null ? request.getPaymentMethod().toUpperCase() : "CARD";
            // Normalise legacy labels used by the DTO (ERA, PATIENT_CARD → CARD, etc.)
            method = switch (raw) {
                case "ERA", "CHECK" -> Payment.PaymentMethod.CHECK;
                case "PATIENT_CASH", "CASH" -> Payment.PaymentMethod.CASH;
                default -> Payment.PaymentMethod.CARD;
            };
        } catch (IllegalArgumentException e) {
            method = Payment.PaymentMethod.CARD;
        }

        Payment payment = Payment.builder()
                .tenantId(tenantId)
                .patientId(claim.getPatientId())
                .claimId(claim.getId())
                .amount(request.getAmount())
                .method(method)
                .stripePaymentIntentId(request.getReferenceNumber())
                .status(Payment.PaymentStatus.COMPLETED)
                .build();
        paymentRepository.save(payment);

        // Update claim paidAmount
        BigDecimal newPaid = (claim.getPaidAmount() != null ? claim.getPaidAmount() : BigDecimal.ZERO)
                .add(request.getAmount());
        claim.setPaidAmount(newPaid);

        // Auto-transition to PAID if fully collected
        if (claim.getTotalCharge() != null && newPaid.compareTo(claim.getTotalCharge()) >= 0) {
            claim.setStatus(ClaimStatus.PAID);
            claim.setPaidAt(Instant.now());
        }
        claimRepository.save(claim);

        log.info("Payment recorded claimUuid={} amount={}", request.getClaimUuid(), request.getAmount());

        return PaymentDto.builder()
                .uuid(payment.getUuid())
                .claimUuid(claim.getUuid())
                .amount(payment.getAmount())
                .paymentDate(request.getPaymentDate())
                .paymentMethod(payment.getMethod().name())
                .referenceNumber(request.getReferenceNumber())
                .recordedAt(payment.getCreatedAt() != null ? payment.getCreatedAt() : Instant.now())
                .build();
    }

    // ── Patient balance ───────────────────────────────────────────────────────

    @Override
    public PatientBalanceDto getPatientBalance(UUID patientUuid) {
        Long tenantId = TenantContext.getTenantId();

        Patient patient = patientRepository.findByTenantIdAndUuid(tenantId, patientUuid)
                .orElseThrow(() -> new PrimusException(ResponseCode.PATIENT_NOT_FOUND,
                        "Patient not found: " + patientUuid));

        List<Claim> claims = claimRepository.findByTenantIdAndPatientId(tenantId, patient.getId(), Pageable.unpaged())
                .getContent();

        BigDecimal totalResponsibility = claims.stream()
                .filter(c -> c.getPatientResponsibility() != null)
                .map(Claim::getPatientResponsibility)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Payment> payments = paymentRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId());
        BigDecimal totalPaid = payments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal currentBalance = totalResponsibility.subtract(totalPaid).max(BigDecimal.ZERO);

        // Overdue: patient responsibility on claims older than 30 days
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        BigDecimal overdueBalance = claims.stream()
                .filter(c -> c.getDateOfService() != null
                        && c.getDateOfService().isBefore(thirtyDaysAgo)
                        && c.getStatus() != ClaimStatus.PAID
                        && c.getPatientResponsibility() != null)
                .map(Claim::getPatientResponsibility)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return PatientBalanceDto.builder()
                .patientUuid(patientUuid)
                .patientName(patient.getFirstName() + " " + patient.getLastName())
                .currentBalance(currentBalance)
                .overdueBalance(overdueBalance)
                .overduedays(overdueBalance.compareTo(BigDecimal.ZERO) > 0 ? 30 : 0)
                .build();
    }

    // ── AR Aging ──────────────────────────────────────────────────────────────

    @Override
    public ArAgingDto getArAging() {
        Long tenantId = TenantContext.getTenantId();
        List<Claim> unpaid = claimRepository.findByTenantId(tenantId).stream()
                .filter(c -> c.getStatus() != ClaimStatus.PAID && c.getDateOfService() != null)
                .toList();

        LocalDate today = LocalDate.now();

        BigDecimal bucket0to30  = BigDecimal.ZERO;
        BigDecimal bucket31to60 = BigDecimal.ZERO;
        BigDecimal bucket61to90 = BigDecimal.ZERO;
        BigDecimal bucket91to120 = BigDecimal.ZERO;
        BigDecimal bucketOver120 = BigDecimal.ZERO;

        for (Claim c : unpaid) {
            long age = ChronoUnit.DAYS.between(c.getDateOfService(), today);
            BigDecimal charge = c.getTotalCharge() != null ? c.getTotalCharge() : BigDecimal.ZERO;
            BigDecimal paidAmt = c.getPaidAmount() != null ? c.getPaidAmount() : BigDecimal.ZERO;
            BigDecimal outstanding = charge.subtract(paidAmt).max(BigDecimal.ZERO);

            if (age <= 30) {
                bucket0to30  = bucket0to30.add(outstanding);
            } else if (age <= 60) {
                bucket31to60 = bucket31to60.add(outstanding);
            } else if (age <= 90) {
                bucket61to90 = bucket61to90.add(outstanding);
            } else if (age <= 120) {
                bucket91to120 = bucket91to120.add(outstanding);
            } else {
                bucketOver120 = bucketOver120.add(outstanding);
            }
        }

        BigDecimal total = bucket0to30.add(bucket31to60).add(bucket61to90)
                .add(bucket91to120).add(bucketOver120);

        return ArAgingDto.builder()
                .current(bucket0to30)
                .days31to60(bucket31to60)
                .days61to90(bucket61to90)
                .days91to120(bucket91to120)
                .over120(bucketOver120)
                .total(total)
                .build();
    }

    // ── Mapping helpers ───────────────────────────────────────────────────────

    private ClaimDto toDto(Claim claim) {
        return ClaimDto.builder()
                .uuid(claim.getUuid())
                .claimNumber("CLM-" + claim.getUuid().toString().substring(0, 8).toUpperCase())
                .patientUuid(resolvePatientUuid(claim.getPatientId()))
                .encounterUuid(resolveEncounterUuid(claim.getEncounterId()))
                .providerId(String.valueOf(claim.getProviderId()))
                .insurancePlanName(claim.getPayerName())
                .serviceDate(claim.getDateOfService())
                .totalCharges(claim.getTotalCharge())
                .allowedAmount(claim.getAllowedAmount())
                .paidAmount(claim.getPaidAmount() != null ? claim.getPaidAmount() : BigDecimal.ZERO)
                .patientResponsibility(claim.getPatientResponsibility())
                .status(claim.getStatus().name())
                .denialCode(claim.getDenialCode())
                .denialReason(claim.getDenialReason())
                .submittedAt(claim.getSubmittedAt())
                .updatedAt(claim.getModifiedAt())
                .build();
    }

    private ClaimDto toDtoWithLines(Claim claim) {
        List<ClaimLine> lines = claimLineRepository.findByClaimId(claim.getId());
        ClaimDto dto = toDto(claim);
        dto.setLines(lines.stream().map(this::toLineDto).toList());
        return dto;
    }

    private ClaimLineDto toLineDto(ClaimLine line) {
        BigDecimal unitCharge = line.getCharge();
        BigDecimal totalCharge = unitCharge != null
                ? unitCharge.multiply(BigDecimal.valueOf(line.getUnits()))
                : BigDecimal.ZERO;
        return ClaimLineDto.builder()
                .cptCode(line.getCptCode())
                .modifier(line.getModifier())
                .units(line.getUnits())
                .unitCharge(unitCharge)
                .totalCharge(totalCharge)
                .build();
    }

    private ClaimStatus parseStatus(String status) {
        try {
            return ClaimStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new PrimusException(ResponseCode.BAD_REQUEST, "Invalid claim status: " + status);
        }
    }

    /** Resolve patient UUID from the patient DB id for the DTO — best-effort. */
    private UUID resolvePatientUuid(Long patientId) {
        if (patientId == null) return null;
        return patientRepository.findById(patientId)
                .map(Patient::getUuid)
                .orElse(null);
    }

    /** Encounter UUID is stored as the entity pk; UUID column is on the entity. */
    private UUID resolveEncounterUuid(Long encounterId) {
        // Encounter repository not injected here; return null — callers that need it
        // should call EncounterService directly to keep service boundaries clean.
        return null;
    }
}
