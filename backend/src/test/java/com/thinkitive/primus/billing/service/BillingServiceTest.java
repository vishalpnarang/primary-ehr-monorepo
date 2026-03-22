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
import com.thinkitive.primus.shared.exception.PrimusException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    private static final Long TENANT_ID = 1L;

    @Mock ClaimRepository claimRepo;
    @Mock ClaimLineRepository claimLineRepo;
    @Mock PaymentRepository paymentRepo;
    @Mock PatientRepository patientRepo;

    @InjectMocks
    BillingServiceImpl billingService;

    private Patient testPatient;

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT_ID);

        testPatient = Patient.builder()
                .tenantId(TENANT_ID)
                .mrn("PAT-10001")
                .firstName("Jane")
                .lastName("Smith")
                .dob(LocalDate.of(1990, 6, 15))
                .sex("FEMALE")
                .status(Patient.PatientStatus.ACTIVE)
                .build();
        testPatient.setId(1L);
        testPatient.setUuid(UUID.randomUUID().toString());
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    // ── getClaim ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getClaim")
    class GetClaim {

        @Test
        @DisplayName("happy path -- returns claim with ICD-10 and CPT lines")
        void getClaim_happyPath() {
            String uuid = UUID.randomUUID().toString();
            Claim claim = buildClaim(ClaimStatus.SUBMITTED, new BigDecimal("250.00"), BigDecimal.ZERO);
            claim.setUuid(uuid);

            ClaimLine line1 = ClaimLine.builder()
                    .tenantId(TENANT_ID)
                    .claimId(1L)
                    .cptCode("99213")
                    .description("Office visit, established patient")
                    .units(1)
                    .charge(new BigDecimal("150.00"))
                    .build();
            line1.setId(1L);
            line1.setUuid(UUID.randomUUID().toString());

            ClaimLine line2 = ClaimLine.builder()
                    .tenantId(TENANT_ID)
                    .claimId(1L)
                    .cptCode("87880")
                    .description("Rapid strep test")
                    .modifier("QW")
                    .units(1)
                    .charge(new BigDecimal("100.00"))
                    .build();
            line2.setId(2L);
            line2.setUuid(UUID.randomUUID().toString());

            when(claimRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(claim));
            when(claimLineRepo.findByClaimId(1L)).thenReturn(List.of(line1, line2));
            when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));

            ClaimDto result = billingService.getClaim(uuid);

            assertThat(result).isNotNull();
            assertThat(result.getUuid()).isEqualTo(uuid);
            assertThat(result.getLines()).hasSize(2);
            assertThat(result.getLines().get(0).getCptCode()).isEqualTo("99213");
            assertThat(result.getLines().get(1).getCptCode()).isEqualTo("87880");
            assertThat(result.getClaimNumber()).startsWith("CLM-");
            assertThat(result.getStatus()).isEqualTo("SUBMITTED");
        }

        @Test
        @DisplayName("not found -- throws PrimusException")
        void getClaim_notFound_throws() {
            String uuid = UUID.randomUUID().toString();
            when(claimRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> billingService.getClaim(uuid))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Claim not found");
        }

        @Test
        @DisplayName("claim with patient uuid resolved from patientRepo")
        void getClaim_resolvesPatientUuid() {
            String uuid = UUID.randomUUID().toString();
            Claim claim = buildClaim(ClaimStatus.SUBMITTED, new BigDecimal("250.00"), BigDecimal.ZERO);
            claim.setUuid(uuid);

            when(claimRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(claim));
            when(claimLineRepo.findByClaimId(1L)).thenReturn(Collections.emptyList());
            when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));

            ClaimDto result = billingService.getClaim(uuid);

            assertThat(result.getPatientUuid()).isEqualTo(testPatient.getUuid());
        }
    }

    // ── submitClaim ───────────────────────────────────────────────────────────

    @Nested
    @DisplayName("submitClaim")
    class SubmitClaim {

        @Test
        @DisplayName("READY claim -- changes status to SUBMITTED with timestamp")
        void submitClaim_ready_succeeds() {
            String uuid = UUID.randomUUID().toString();
            Claim claim = buildClaim(ClaimStatus.READY, new BigDecimal("250.00"), BigDecimal.ZERO);
            claim.setUuid(uuid);

            when(claimRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(claim));
            when(claimRepo.save(any(Claim.class))).thenAnswer(inv -> inv.getArgument(0));
            when(claimLineRepo.findByClaimId(1L)).thenReturn(Collections.emptyList());
            when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));

            ClaimDto result = billingService.submitClaim(uuid);

            assertThat(result.getStatus()).isEqualTo("SUBMITTED");
            assertThat(result.getSubmittedAt()).isNotNull();
        }

        @Test
        @DisplayName("non-READY claim -- throws BAD_REQUEST")
        void submitClaim_nonReady_throws() {
            String uuid = UUID.randomUUID().toString();
            Claim claim = buildClaim(ClaimStatus.SUBMITTED, new BigDecimal("250.00"), BigDecimal.ZERO);
            claim.setUuid(uuid);
            claim.setSubmittedAt(Instant.now());

            when(claimRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(claim));

            assertThatThrownBy(() -> billingService.submitClaim(uuid))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("READY");
        }

        @Test
        @DisplayName("DENIED claim cannot be submitted")
        void submitClaim_denied_throws() {
            String uuid = UUID.randomUUID().toString();
            Claim claim = buildClaim(ClaimStatus.DENIED, new BigDecimal("250.00"), BigDecimal.ZERO);
            claim.setUuid(uuid);

            when(claimRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(claim));

            assertThatThrownBy(() -> billingService.submitClaim(uuid))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("READY");
        }

        @Test
        @DisplayName("not found -- throws NOT_FOUND")
        void submitClaim_notFound_throws() {
            String uuid = UUID.randomUUID().toString();
            when(claimRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> billingService.submitClaim(uuid))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Claim not found");
        }
    }

    // ── denyClaim ─────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("denyClaim")
    class DenyClaim {

        @Test
        @DisplayName("sets status to DENIED with denial code and reason")
        void denyClaim_setsFields() {
            String uuid = UUID.randomUUID().toString();
            Claim claim = buildClaim(ClaimStatus.SUBMITTED, new BigDecimal("250.00"), BigDecimal.ZERO);
            claim.setUuid(uuid);

            when(claimRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(claim));
            when(claimRepo.save(any(Claim.class))).thenAnswer(inv -> inv.getArgument(0));
            when(claimLineRepo.findByClaimId(1L)).thenReturn(Collections.emptyList());
            when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));

            ClaimDenyRequest request = new ClaimDenyRequest();
            request.setDenialCode("CO-45");
            request.setDenialReason("Charges exceed contracted rate");

            ClaimDto result = billingService.denyClaim(uuid, request);

            assertThat(result.getStatus()).isEqualTo("DENIED");
            assertThat(result.getDenialCode()).isEqualTo("CO-45");
            assertThat(result.getDenialReason()).isEqualTo("Charges exceed contracted rate");
        }

        @Test
        @DisplayName("not found -- throws NOT_FOUND")
        void denyClaim_notFound_throws() {
            String uuid = UUID.randomUUID().toString();
            when(claimRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.empty());

            ClaimDenyRequest request = new ClaimDenyRequest();
            request.setDenialCode("CO-45");
            request.setDenialReason("test");

            assertThatThrownBy(() -> billingService.denyClaim(uuid, request))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Claim not found");
        }
    }

    // ── appealClaim ───────────────────────────────────────────────────────────

    @Nested
    @DisplayName("appealClaim")
    class AppealClaim {

        @Test
        @DisplayName("DENIED claim -- changes status to APPEALED")
        void appealClaim_denied_succeeds() {
            String uuid = UUID.randomUUID().toString();
            Claim claim = buildClaim(ClaimStatus.DENIED, new BigDecimal("250.00"), BigDecimal.ZERO);
            claim.setUuid(uuid);
            claim.setDenialCode("CO-45");
            claim.setDenialReason("Charges exceed contracted rate");

            when(claimRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(claim));
            when(claimRepo.save(any(Claim.class))).thenAnswer(inv -> inv.getArgument(0));
            when(claimLineRepo.findByClaimId(1L)).thenReturn(Collections.emptyList());
            when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));

            ClaimAppealRequest request = new ClaimAppealRequest();
            request.setAppealReason("Service was medically necessary per clinical guidelines");

            ClaimDto result = billingService.appealClaim(uuid, request);

            assertThat(result.getStatus()).isEqualTo("APPEALED");
        }

        @Test
        @DisplayName("non-DENIED claim -- throws BAD_REQUEST")
        void appealClaim_nonDenied_throws() {
            String uuid = UUID.randomUUID().toString();
            Claim claim = buildClaim(ClaimStatus.SUBMITTED, new BigDecimal("250.00"), BigDecimal.ZERO);
            claim.setUuid(uuid);

            when(claimRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(claim));

            ClaimAppealRequest request = new ClaimAppealRequest();
            request.setAppealReason("Service was medically necessary");

            assertThatThrownBy(() -> billingService.appealClaim(uuid, request))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("DENIED");
        }

        @Test
        @DisplayName("READY claim cannot be appealed")
        void appealClaim_ready_throws() {
            String uuid = UUID.randomUUID().toString();
            Claim claim = buildClaim(ClaimStatus.READY, new BigDecimal("250.00"), BigDecimal.ZERO);
            claim.setUuid(uuid);

            when(claimRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(claim));

            ClaimAppealRequest request = new ClaimAppealRequest();
            request.setAppealReason("Cannot appeal a ready claim");

            assertThatThrownBy(() -> billingService.appealClaim(uuid, request))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("DENIED");
        }

        @Test
        @DisplayName("PAID claim cannot be appealed")
        void appealClaim_paid_throws() {
            String uuid = UUID.randomUUID().toString();
            Claim claim = buildClaim(ClaimStatus.PAID, new BigDecimal("250.00"), new BigDecimal("250.00"));
            claim.setUuid(uuid);

            when(claimRepo.findByTenantIdAndUuid(TENANT_ID, uuid)).thenReturn(Optional.of(claim));

            ClaimAppealRequest request = new ClaimAppealRequest();
            request.setAppealReason("Cannot appeal a paid claim");

            assertThatThrownBy(() -> billingService.appealClaim(uuid, request))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("DENIED");
        }
    }

    // ── listClaims ────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("listClaims")
    class ListClaims {

        @Test
        @DisplayName("no status filter -- returns all claims paged")
        void listClaims_noFilter() {
            Claim c1 = buildClaim(ClaimStatus.SUBMITTED, new BigDecimal("250.00"), BigDecimal.ZERO);
            Claim c2 = buildClaim(ClaimStatus.PAID, new BigDecimal("300.00"), new BigDecimal("300.00"));

            PageRequest pageable = PageRequest.of(0, 20);
            when(claimRepo.findByTenantId(TENANT_ID, pageable))
                    .thenReturn(new PageImpl<>(List.of(c1, c2), pageable, 2));
            when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));

            Page<ClaimDto> page = billingService.listClaims(null, pageable);

            assertThat(page.getContent()).hasSize(2);
        }

        @Test
        @DisplayName("with status filter -- returns only matching claims")
        void listClaims_withStatusFilter() {
            Claim s1 = buildClaim(ClaimStatus.SUBMITTED, new BigDecimal("150.00"), BigDecimal.ZERO);
            Claim s2 = buildClaim(ClaimStatus.SUBMITTED, new BigDecimal("200.00"), BigDecimal.ZERO);

            PageRequest pageable = PageRequest.of(0, 20);
            when(claimRepo.findByTenantIdAndStatus(TENANT_ID, ClaimStatus.SUBMITTED, pageable))
                    .thenReturn(new PageImpl<>(List.of(s1, s2), pageable, 2));
            when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));

            Page<ClaimDto> page = billingService.listClaims("SUBMITTED", pageable);

            assertThat(page.getContent()).hasSize(2);
            page.getContent().forEach(c -> assertThat(c.getStatus()).isEqualTo("SUBMITTED"));
        }

        @Test
        @DisplayName("invalid status filter -- throws BAD_REQUEST")
        void listClaims_invalidStatus_throws() {
            PageRequest pageable = PageRequest.of(0, 20);

            assertThatThrownBy(() -> billingService.listClaims("INVALID_STATUS", pageable))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Invalid claim status");
        }

        @Test
        @DisplayName("all claims have required fields")
        void listClaims_requiredFields() {
            Claim claim = buildClaim(ClaimStatus.SUBMITTED, new BigDecimal("250.00"), BigDecimal.ZERO);

            PageRequest pageable = PageRequest.of(0, 20);
            when(claimRepo.findByTenantId(TENANT_ID, pageable))
                    .thenReturn(new PageImpl<>(List.of(claim), pageable, 1));
            when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));

            Page<ClaimDto> page = billingService.listClaims(null, pageable);

            page.getContent().forEach(c -> {
                assertThat(c.getUuid()).isNotNull();
                assertThat(c.getClaimNumber()).startsWith("CLM-");
                assertThat(c.getPatientUuid()).isNotNull();
                assertThat(c.getTotalCharges()).isGreaterThan(BigDecimal.ZERO);
                assertThat(c.getStatus()).isNotBlank();
            });
        }
    }

    // ── getArAging ────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getArAging")
    class GetArAging {

        @Test
        @DisplayName("returns correct aging buckets")
        void getArAging_correctBuckets() {
            LocalDate today = LocalDate.now();

            Claim current = buildClaimWithDate(ClaimStatus.SUBMITTED,
                    new BigDecimal("100.00"), BigDecimal.ZERO, today.minusDays(15));
            Claim aging31 = buildClaimWithDate(ClaimStatus.SUBMITTED,
                    new BigDecimal("200.00"), BigDecimal.ZERO, today.minusDays(45));
            Claim aging61 = buildClaimWithDate(ClaimStatus.SUBMITTED,
                    new BigDecimal("300.00"), BigDecimal.ZERO, today.minusDays(75));
            Claim aging91 = buildClaimWithDate(ClaimStatus.SUBMITTED,
                    new BigDecimal("400.00"), BigDecimal.ZERO, today.minusDays(105));
            Claim over120 = buildClaimWithDate(ClaimStatus.SUBMITTED,
                    new BigDecimal("500.00"), BigDecimal.ZERO, today.minusDays(150));

            when(claimRepo.findByTenantId(TENANT_ID))
                    .thenReturn(List.of(current, aging31, aging61, aging91, over120));

            ArAgingDto aging = billingService.getArAging();

            assertThat(aging.getCurrent()).isEqualByComparingTo(new BigDecimal("100.00"));
            assertThat(aging.getDays31to60()).isEqualByComparingTo(new BigDecimal("200.00"));
            assertThat(aging.getDays61to90()).isEqualByComparingTo(new BigDecimal("300.00"));
            assertThat(aging.getDays91to120()).isEqualByComparingTo(new BigDecimal("400.00"));
            assertThat(aging.getOver120()).isEqualByComparingTo(new BigDecimal("500.00"));
            assertThat(aging.getTotal()).isEqualByComparingTo(new BigDecimal("1500.00"));
        }

        @Test
        @DisplayName("paid claims are excluded from AR aging")
        void getArAging_excludesPaid() {
            LocalDate today = LocalDate.now();

            Claim paid = buildClaimWithDate(ClaimStatus.PAID,
                    new BigDecimal("500.00"), new BigDecimal("500.00"), today.minusDays(15));
            Claim unpaid = buildClaimWithDate(ClaimStatus.SUBMITTED,
                    new BigDecimal("200.00"), BigDecimal.ZERO, today.minusDays(15));

            when(claimRepo.findByTenantId(TENANT_ID)).thenReturn(List.of(paid, unpaid));

            ArAgingDto aging = billingService.getArAging();

            // Only unpaid claim should be in the aging
            assertThat(aging.getTotal()).isEqualByComparingTo(new BigDecimal("200.00"));
        }

        @Test
        @DisplayName("partially paid claims show outstanding balance")
        void getArAging_partiallyPaid() {
            LocalDate today = LocalDate.now();

            Claim partial = buildClaimWithDate(ClaimStatus.SUBMITTED,
                    new BigDecimal("300.00"), new BigDecimal("100.00"), today.minusDays(15));

            when(claimRepo.findByTenantId(TENANT_ID)).thenReturn(List.of(partial));

            ArAgingDto aging = billingService.getArAging();

            assertThat(aging.getCurrent()).isEqualByComparingTo(new BigDecimal("200.00"));
        }

        @Test
        @DisplayName("empty claims list -- all buckets zero")
        void getArAging_noClaims() {
            when(claimRepo.findByTenantId(TENANT_ID)).thenReturn(Collections.emptyList());

            ArAgingDto aging = billingService.getArAging();

            assertThat(aging.getTotal()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(aging.getCurrent()).isEqualByComparingTo(BigDecimal.ZERO);
        }
    }

    // ── getBillingKpi ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getBillingKpi")
    class GetBillingKpi {

        @Test
        @DisplayName("returns correct KPI structure")
        void getBillingKpi_structure() {
            Claim submitted = buildClaim(ClaimStatus.SUBMITTED, new BigDecimal("250.00"), new BigDecimal("100.00"));
            submitted.setSubmittedAt(Instant.now());
            Claim paid = buildClaim(ClaimStatus.PAID, new BigDecimal("300.00"), new BigDecimal("300.00"));
            paid.setSubmittedAt(Instant.now());
            Claim denied = buildClaim(ClaimStatus.DENIED, new BigDecimal("150.00"), BigDecimal.ZERO);
            denied.setSubmittedAt(Instant.now());

            when(claimRepo.findByTenantId(TENANT_ID)).thenReturn(List.of(submitted, paid, denied));
            when(paymentRepo.findByTenantIdAndCreatedAtAfter(eq(TENANT_ID), any(Instant.class)))
                    .thenReturn(Collections.emptyList());

            BillingKpiDto kpi = billingService.getBillingKpi();

            assertThat(kpi).isNotNull();
            assertThat(kpi.getTotalCharges()).isEqualByComparingTo(new BigDecimal("700.00"));
            assertThat(kpi.getTotalCollected()).isEqualByComparingTo(new BigDecimal("400.00"));
            assertThat(kpi.getTotalAr()).isEqualByComparingTo(new BigDecimal("300.00"));
            assertThat(kpi.getCleanClaimRate()).isBetween(0.0, 100.0);
            assertThat(kpi.getDenialRate()).isBetween(0.0, 100.0);
            assertThat(kpi.getCollectionRate()).isBetween(0.0, 100.0);
            assertThat(kpi.getTotalClaimsSubmitted()).isEqualTo(3);
            assertThat(kpi.getTotalClaimsDenied()).isEqualTo(1);
        }

        @Test
        @DisplayName("AR equals charges minus collected")
        void getBillingKpi_arEquation() {
            Claim paid = buildClaim(ClaimStatus.PAID, new BigDecimal("500.00"), new BigDecimal("500.00"));
            paid.setSubmittedAt(Instant.now());
            Claim unpaid = buildClaim(ClaimStatus.SUBMITTED, new BigDecimal("200.00"), BigDecimal.ZERO);
            unpaid.setSubmittedAt(Instant.now());

            when(claimRepo.findByTenantId(TENANT_ID)).thenReturn(List.of(paid, unpaid));
            when(paymentRepo.findByTenantIdAndCreatedAtAfter(eq(TENANT_ID), any(Instant.class)))
                    .thenReturn(Collections.emptyList());

            BillingKpiDto kpi = billingService.getBillingKpi();

            BigDecimal expectedAr = kpi.getTotalCharges().subtract(kpi.getTotalCollected());
            assertThat(kpi.getTotalAr()).isEqualByComparingTo(expectedAr);
        }

        @Test
        @DisplayName("no claims -- all metrics zero")
        void getBillingKpi_noClaims() {
            when(claimRepo.findByTenantId(TENANT_ID)).thenReturn(Collections.emptyList());
            when(paymentRepo.findByTenantIdAndCreatedAtAfter(eq(TENANT_ID), any(Instant.class)))
                    .thenReturn(Collections.emptyList());

            BillingKpiDto kpi = billingService.getBillingKpi();

            assertThat(kpi.getTotalCharges()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(kpi.getTotalCollected()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(kpi.getTotalAr()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(kpi.getTotalClaimsSubmitted()).isEqualTo(0);
            assertThat(kpi.getTotalClaimsDenied()).isEqualTo(0);
        }

        @Test
        @DisplayName("denied claims count correctly")
        void getBillingKpi_deniedCount() {
            Claim denied1 = buildClaim(ClaimStatus.DENIED, new BigDecimal("100.00"), BigDecimal.ZERO);
            denied1.setSubmittedAt(Instant.now());
            Claim denied2 = buildClaim(ClaimStatus.DENIED, new BigDecimal("200.00"), BigDecimal.ZERO);
            denied2.setSubmittedAt(Instant.now());
            Claim appealed = buildClaim(ClaimStatus.APPEALED, new BigDecimal("150.00"), BigDecimal.ZERO);
            appealed.setSubmittedAt(Instant.now());

            when(claimRepo.findByTenantId(TENANT_ID)).thenReturn(List.of(denied1, denied2, appealed));
            when(paymentRepo.findByTenantIdAndCreatedAtAfter(eq(TENANT_ID), any(Instant.class)))
                    .thenReturn(Collections.emptyList());

            BillingKpiDto kpi = billingService.getBillingKpi();

            assertThat(kpi.getTotalClaimsDenied()).isEqualTo(2);
            assertThat(kpi.getTotalClaimsAppealed()).isEqualTo(1);
        }
    }

    // ── recordPayment ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("recordPayment")
    class RecordPayment {

        @Test
        @DisplayName("happy path -- records payment and updates claim")
        void recordPayment_happyPath() {
            String claimUuid = UUID.randomUUID().toString();
            Claim claim = buildClaim(ClaimStatus.SUBMITTED, new BigDecimal("250.00"), BigDecimal.ZERO);
            claim.setUuid(claimUuid);

            when(claimRepo.findByTenantIdAndUuid(TENANT_ID, claimUuid)).thenReturn(Optional.of(claim));
            when(paymentRepo.save(any(Payment.class))).thenAnswer(inv -> {
                Payment p = inv.getArgument(0);
                p.setId(1L);
                p.setUuid(UUID.randomUUID().toString());
                return p;
            });
            when(claimRepo.save(any(Claim.class))).thenAnswer(inv -> inv.getArgument(0));

            PaymentRequest request = new PaymentRequest();
            request.setClaimUuid(claimUuid);
            request.setAmount(new BigDecimal("100.00"));
            request.setPaymentDate(LocalDate.now());
            request.setPaymentMethod("CARD");

            PaymentDto result = billingService.recordPayment(request);

            assertThat(result).isNotNull();
            assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("100.00"));
            assertThat(result.getClaimUuid()).isEqualTo(claimUuid);
        }

        @Test
        @DisplayName("full payment -- auto-transitions claim to PAID")
        void recordPayment_fullPayment_autoTransitionsToPaid() {
            String claimUuid = UUID.randomUUID().toString();
            Claim claim = buildClaim(ClaimStatus.SUBMITTED, new BigDecimal("250.00"), BigDecimal.ZERO);
            claim.setUuid(claimUuid);

            when(claimRepo.findByTenantIdAndUuid(TENANT_ID, claimUuid)).thenReturn(Optional.of(claim));
            when(paymentRepo.save(any(Payment.class))).thenAnswer(inv -> {
                Payment p = inv.getArgument(0);
                p.setId(1L);
                p.setUuid(UUID.randomUUID().toString());
                return p;
            });
            when(claimRepo.save(any(Claim.class))).thenAnswer(inv -> inv.getArgument(0));

            PaymentRequest request = new PaymentRequest();
            request.setClaimUuid(claimUuid);
            request.setAmount(new BigDecimal("250.00"));
            request.setPaymentDate(LocalDate.now());
            request.setPaymentMethod("CHECK");

            billingService.recordPayment(request);

            verify(claimRepo).save(argThat(c -> c.getStatus() == ClaimStatus.PAID));
        }

        @Test
        @DisplayName("claim not found -- throws NOT_FOUND")
        void recordPayment_claimNotFound_throws() {
            String claimUuid = UUID.randomUUID().toString();
            when(claimRepo.findByTenantIdAndUuid(TENANT_ID, claimUuid)).thenReturn(Optional.empty());

            PaymentRequest request = new PaymentRequest();
            request.setClaimUuid(claimUuid);
            request.setAmount(new BigDecimal("100.00"));
            request.setPaymentDate(LocalDate.now());

            assertThatThrownBy(() -> billingService.recordPayment(request))
                    .isInstanceOf(PrimusException.class)
                    .hasMessageContaining("Claim not found");
        }

        @Test
        @DisplayName("cash payment method is resolved correctly")
        void recordPayment_cashMethod() {
            String claimUuid = UUID.randomUUID().toString();
            Claim claim = buildClaim(ClaimStatus.SUBMITTED, new BigDecimal("250.00"), BigDecimal.ZERO);
            claim.setUuid(claimUuid);

            when(claimRepo.findByTenantIdAndUuid(TENANT_ID, claimUuid)).thenReturn(Optional.of(claim));
            when(paymentRepo.save(any(Payment.class))).thenAnswer(inv -> {
                Payment p = inv.getArgument(0);
                assertThat(p.getMethod()).isEqualTo(Payment.PaymentMethod.CASH);
                p.setId(1L);
                p.setUuid(UUID.randomUUID().toString());
                return p;
            });
            when(claimRepo.save(any(Claim.class))).thenAnswer(inv -> inv.getArgument(0));

            PaymentRequest request = new PaymentRequest();
            request.setClaimUuid(claimUuid);
            request.setAmount(new BigDecimal("50.00"));
            request.setPaymentDate(LocalDate.now());
            request.setPaymentMethod("PATIENT_CASH");

            billingService.recordPayment(request);

            verify(paymentRepo).save(argThat(p -> p.getMethod() == Payment.PaymentMethod.CASH));
        }
    }

    // ── tenant isolation ──────────────────────────────────────────────────────

    @Test
    @DisplayName("all operations use tenant ID from TenantContext")
    void tenantIsolation() {
        TenantContext.setTenantId(77L);

        String uuid = UUID.randomUUID().toString();
        when(claimRepo.findByTenantIdAndUuid(77L, uuid)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> billingService.getClaim(uuid))
                .isInstanceOf(PrimusException.class);

        verify(claimRepo).findByTenantIdAndUuid(eq(77L), eq(uuid));
        verify(claimRepo, never()).findByTenantIdAndUuid(eq(TENANT_ID), anyString());
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Claim buildClaim(ClaimStatus status, BigDecimal totalCharge, BigDecimal paidAmount) {
        Claim claim = Claim.builder()
                .tenantId(TENANT_ID)
                .patientId(1L)
                .encounterId(1L)
                .providerId(1L)
                .dateOfService(LocalDate.now().minusDays(10))
                .payerName("Aetna")
                .totalCharge(totalCharge)
                .paidAmount(paidAmount)
                .patientResponsibility(new BigDecimal("25.00"))
                .status(status)
                .build();
        claim.setId(1L);
        claim.setUuid(UUID.randomUUID().toString());
        return claim;
    }

    private Claim buildClaimWithDate(ClaimStatus status, BigDecimal totalCharge,
                                     BigDecimal paidAmount, LocalDate dateOfService) {
        Claim claim = Claim.builder()
                .tenantId(TENANT_ID)
                .patientId(1L)
                .encounterId(1L)
                .providerId(1L)
                .dateOfService(dateOfService)
                .payerName("Aetna")
                .totalCharge(totalCharge)
                .paidAmount(paidAmount)
                .patientResponsibility(new BigDecimal("25.00"))
                .status(status)
                .build();
        claim.setId(System.nanoTime());
        claim.setUuid(UUID.randomUUID().toString());
        return claim;
    }
}
