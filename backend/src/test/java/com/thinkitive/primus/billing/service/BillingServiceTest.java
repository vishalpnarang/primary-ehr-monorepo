package com.thinkitive.primus.billing.service;

import com.thinkitive.primus.billing.dto.BillingKpiDto;
import com.thinkitive.primus.billing.dto.ClaimDto;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.exception.PrimusException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @InjectMocks
    BillingServiceImpl billingService;

    @BeforeEach
    void setTenant() {
        TenantContext.setTenantId(1L);
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    @Test
    void getBillingKpi_returnsCorrectStructure() {
        BillingKpiDto kpi = billingService.getBillingKpi();

        assertThat(kpi).isNotNull();
        assertThat(kpi.getTotalCharges()).isNotNull().isGreaterThan(BigDecimal.ZERO);
        assertThat(kpi.getTotalCollected()).isNotNull().isGreaterThan(BigDecimal.ZERO);
        assertThat(kpi.getTotalAr()).isNotNull().isGreaterThanOrEqualTo(BigDecimal.ZERO);
        assertThat(kpi.getCleanClaimRate()).isGreaterThan(0.0).isLessThanOrEqualTo(100.0);
        assertThat(kpi.getDenialRate()).isGreaterThanOrEqualTo(0.0).isLessThanOrEqualTo(100.0);
        assertThat(kpi.getCollectionRate()).isGreaterThan(0.0).isLessThanOrEqualTo(100.0);
        assertThat(kpi.getTotalClaimsSubmitted()).isGreaterThan(0);
        assertThat(kpi.getTotalClaimsDenied()).isGreaterThanOrEqualTo(0);
    }

    @Test
    void getBillingKpi_arEqualsChargesMinusCollected() {
        BillingKpiDto kpi = billingService.getBillingKpi();

        BigDecimal expectedAr = kpi.getTotalCharges().subtract(kpi.getTotalCollected());
        assertThat(kpi.getTotalAr()).isEqualByComparingTo(expectedAr);
    }

    @Test
    void submitClaim_withReadyStatus_throws_becauseStubReturnsSubmitted() {
        // Phase-0 stub: getClaim always returns SUBMITTED status.
        // submitClaim guard rejects already-submitted claims.
        UUID uuid = UUID.randomUUID();

        assertThatThrownBy(() -> billingService.submitClaim(uuid))
                .isInstanceOf(PrimusException.class)
                .hasMessageContaining("already submitted");
    }

    @Test
    void listClaims_returnsPagedResults() {
        Page<ClaimDto> page = billingService.listClaims(null, PageRequest.of(0, 20));

        assertThat(page).isNotNull();
        assertThat(page.getContent()).isNotEmpty();
        assertThat(page.getContent()).hasSize(2);
    }

    @Test
    void listClaims_allClaimsHaveRequiredFields() {
        Page<ClaimDto> page = billingService.listClaims(null, PageRequest.of(0, 20));

        page.getContent().forEach(claim -> {
            assertThat(claim.getUuid()).isNotNull();
            assertThat(claim.getClaimNumber()).startsWith("CLM-");
            assertThat(claim.getPatientUuid()).isNotNull();
            assertThat(claim.getTotalCharges()).isGreaterThan(BigDecimal.ZERO);
            assertThat(claim.getStatus()).isNotBlank();
        });
    }

    @Test
    void getClaim_returnsCorrectStructure() {
        UUID uuid = UUID.randomUUID();

        ClaimDto claim = billingService.getClaim(uuid);

        assertThat(claim).isNotNull();
        assertThat(claim.getUuid()).isEqualTo(uuid);
        assertThat(claim.getLines()).isNotEmpty();
        assertThat(claim.getClearinghouse()).isEqualTo("AVAILITY");
    }

    @Test
    void appealClaim_nonDenied_shouldThrow() {
        // getClaim stub returns SUBMITTED status — only DENIED claims can be appealed
        UUID uuid = UUID.randomUUID();
        com.thinkitive.primus.billing.dto.ClaimAppealRequest request =
                new com.thinkitive.primus.billing.dto.ClaimAppealRequest();
        request.setAppealReason("Incorrect denial — service was medically necessary");

        assertThatThrownBy(() -> billingService.appealClaim(uuid, request))
                .isInstanceOf(PrimusException.class)
                .hasMessageContaining("denied claims");
    }
}
