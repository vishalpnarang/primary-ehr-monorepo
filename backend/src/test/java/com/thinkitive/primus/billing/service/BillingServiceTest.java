package com.thinkitive.primus.billing.service;

import com.thinkitive.primus.billing.dto.BillingKpiDto;
import com.thinkitive.primus.billing.dto.ClaimAppealRequest;
import com.thinkitive.primus.billing.dto.ClaimDto;
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @Mock ClaimRepository claimRepo;
    @Mock ClaimLineRepository claimLineRepo;
    @Mock PaymentRepository paymentRepo;
    @Mock PatientRepository patientRepo;

    @InjectMocks
    BillingServiceImpl billingService;

    private Patient testPatient;

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(1L);

        testPatient = Patient.builder()
                .tenantId(1L)
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

    @Test
    void getBillingKpi_returnsCorrectStructure() {
        Claim submittedClaim = buildClaim(ClaimStatus.SUBMITTED, new BigDecimal("250.00"), new BigDecimal("100.00"));
        submittedClaim.setSubmittedAt(Instant.now());
        Claim paidClaim = buildClaim(ClaimStatus.PAID, new BigDecimal("300.00"), new BigDecimal("300.00"));
        paidClaim.setSubmittedAt(Instant.now());
        Claim deniedClaim = buildClaim(ClaimStatus.DENIED, new BigDecimal("150.00"), BigDecimal.ZERO);
        deniedClaim.setSubmittedAt(Instant.now());

        when(claimRepo.findByTenantId(1L)).thenReturn(List.of(submittedClaim, paidClaim, deniedClaim));
        when(paymentRepo.findByTenantIdAndCreatedAtAfter(eq(1L), any(Instant.class)))
                .thenReturn(Collections.emptyList());

        BillingKpiDto kpi = billingService.getBillingKpi();

        assertThat(kpi).isNotNull();
        assertThat(kpi.getTotalCharges()).isNotNull().isGreaterThan(BigDecimal.ZERO);
        assertThat(kpi.getTotalCollected()).isNotNull().isGreaterThanOrEqualTo(BigDecimal.ZERO);
        assertThat(kpi.getTotalAr()).isNotNull().isGreaterThanOrEqualTo(BigDecimal.ZERO);
        assertThat(kpi.getCleanClaimRate()).isGreaterThanOrEqualTo(0.0).isLessThanOrEqualTo(100.0);
        assertThat(kpi.getDenialRate()).isGreaterThanOrEqualTo(0.0).isLessThanOrEqualTo(100.0);
        assertThat(kpi.getCollectionRate()).isGreaterThanOrEqualTo(0.0).isLessThanOrEqualTo(100.0);
        assertThat(kpi.getTotalClaimsSubmitted()).isGreaterThan(0);
        assertThat(kpi.getTotalClaimsDenied()).isGreaterThanOrEqualTo(0);
    }

    @Test
    void getBillingKpi_arEqualsChargesMinusCollected() {
        Claim paidClaim = buildClaim(ClaimStatus.PAID, new BigDecimal("500.00"), new BigDecimal("500.00"));
        paidClaim.setSubmittedAt(Instant.now());
        Claim unpaidClaim = buildClaim(ClaimStatus.SUBMITTED, new BigDecimal("200.00"), BigDecimal.ZERO);
        unpaidClaim.setSubmittedAt(Instant.now());

        when(claimRepo.findByTenantId(1L)).thenReturn(List.of(paidClaim, unpaidClaim));
        when(paymentRepo.findByTenantIdAndCreatedAtAfter(eq(1L), any(Instant.class)))
                .thenReturn(Collections.emptyList());

        BillingKpiDto kpi = billingService.getBillingKpi();

        BigDecimal expectedAr = kpi.getTotalCharges().subtract(kpi.getTotalCollected());
        assertThat(kpi.getTotalAr()).isEqualByComparingTo(expectedAr);
    }

    @Test
    void submitClaim_withNonReadyStatus_shouldThrow() {
        String uuid = UUID.randomUUID().toString();
        Claim claim = buildClaim(ClaimStatus.SUBMITTED, new BigDecimal("250.00"), BigDecimal.ZERO);
        claim.setUuid(uuid);
        claim.setSubmittedAt(Instant.now());

        when(claimRepo.findByTenantIdAndUuid(1L, uuid)).thenReturn(Optional.of(claim));

        assertThatThrownBy(() -> billingService.submitClaim(uuid))
                .isInstanceOf(PrimusException.class)
                .hasMessageContaining("READY");
    }

    @Test
    void listClaims_returnsPagedResults() {
        Claim claim1 = buildClaim(ClaimStatus.SUBMITTED, new BigDecimal("250.00"), BigDecimal.ZERO);
        Claim claim2 = buildClaim(ClaimStatus.PAID, new BigDecimal("300.00"), new BigDecimal("300.00"));

        PageRequest pageable = PageRequest.of(0, 20);
        when(claimRepo.findByTenantId(eq(1L), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(claim1, claim2), pageable, 2));
        // Mock patient lookups for resolvePatientUuid
        when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));

        Page<ClaimDto> page = billingService.listClaims(null, pageable);

        assertThat(page).isNotNull();
        assertThat(page.getContent()).isNotEmpty();
        assertThat(page.getContent()).hasSize(2);
    }

    @Test
    void listClaims_allClaimsHaveRequiredFields() {
        Claim claim = buildClaim(ClaimStatus.SUBMITTED, new BigDecimal("250.00"), BigDecimal.ZERO);

        PageRequest pageable = PageRequest.of(0, 20);
        when(claimRepo.findByTenantId(eq(1L), eq(pageable)))
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

    @Test
    void getClaim_returnsClaimWithLines() {
        String uuid = UUID.randomUUID().toString();
        Claim claim = buildClaim(ClaimStatus.SUBMITTED, new BigDecimal("250.00"), BigDecimal.ZERO);
        claim.setUuid(uuid);

        ClaimLine line = ClaimLine.builder()
                .tenantId(1L)
                .claimId(1L)
                .cptCode("99213")
                .units(1)
                .charge(new BigDecimal("250.00"))
                .build();
        line.setId(1L);
        line.setUuid(UUID.randomUUID().toString());

        when(claimRepo.findByTenantIdAndUuid(1L, uuid)).thenReturn(Optional.of(claim));
        when(claimLineRepo.findByClaimId(1L)).thenReturn(List.of(line));
        when(patientRepo.findById(1L)).thenReturn(Optional.of(testPatient));

        ClaimDto result = billingService.getClaim(uuid);

        assertThat(result).isNotNull();
        assertThat(result.getUuid()).isEqualTo(uuid);
        assertThat(result.getLines()).isNotEmpty();
    }

    @Test
    void appealClaim_nonDenied_shouldThrow() {
        String uuid = UUID.randomUUID().toString();
        Claim claim = buildClaim(ClaimStatus.SUBMITTED, new BigDecimal("250.00"), BigDecimal.ZERO);
        claim.setUuid(uuid);

        when(claimRepo.findByTenantIdAndUuid(1L, uuid)).thenReturn(Optional.of(claim));

        ClaimAppealRequest request = new ClaimAppealRequest();
        request.setAppealReason("Incorrect denial - service was medically necessary");

        assertThatThrownBy(() -> billingService.appealClaim(uuid, request))
                .isInstanceOf(PrimusException.class)
                .hasMessageContaining("DENIED");
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Claim buildClaim(ClaimStatus status, BigDecimal totalCharge, BigDecimal paidAmount) {
        Claim claim = Claim.builder()
                .tenantId(1L)
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
}
