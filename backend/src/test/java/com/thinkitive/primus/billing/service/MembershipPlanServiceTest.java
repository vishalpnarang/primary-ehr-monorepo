package com.thinkitive.primus.billing.service;

import com.thinkitive.primus.billing.dto.*;
import com.thinkitive.primus.billing.entity.MembershipPlan;
import com.thinkitive.primus.billing.entity.PlanEnrollment;
import com.thinkitive.primus.billing.repository.MembershipPlanRepository;
import com.thinkitive.primus.billing.repository.PlanEnrollmentRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.exception.PrimusException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MembershipPlanServiceTest {

    @Mock MembershipPlanRepository membershipPlanRepository;
    @Mock PlanEnrollmentRepository planEnrollmentRepository;

    @InjectMocks
    MembershipPlanServiceImpl membershipPlanService;

    private MembershipPlan testPlan;
    private PlanEnrollment testEnrollment;
    private final String planUuid       = UUID.randomUUID().toString();
    private final String enrollmentUuid = UUID.randomUUID().toString();

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(1L);

        testPlan = MembershipPlan.builder()
                .tenantId(1L)
                .name("Primary Care Plus")
                .description("Unlimited primary care visits with no copay")
                .priceMonthly(new BigDecimal("99.00"))
                .priceAnnual(new BigDecimal("999.00"))
                .maxVisitsPerYear(24)
                .includesTelehealth(true)
                .isActive(true)
                .build();
        testPlan.setId(1L);
        testPlan.setUuid(planUuid);

        testEnrollment = PlanEnrollment.builder()
                .tenantId(1L)
                .patientId(100L)
                .planId(1L)
                .startDate(LocalDate.now().minusDays(30))
                .status(PlanEnrollment.EnrollmentStatus.ACTIVE)
                .billingInterval(PlanEnrollment.BillingInterval.MONTHLY)
                .build();
        testEnrollment.setId(5L);
        testEnrollment.setUuid(enrollmentUuid);
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("createPlan persists membership plan and returns DTO")
    void createPlan_persistsAndReturnsDto() {
        CreateMembershipPlanRequest request = new CreateMembershipPlanRequest();
        request.setName("Primary Care Plus");
        request.setDescription("Unlimited primary care visits with no copay");
        request.setPriceMonthly(new BigDecimal("99.00"));
        request.setPriceAnnual(new BigDecimal("999.00"));
        request.setMaxVisitsPerYear(24);
        request.setIncludesTelehealth(true);

        when(membershipPlanRepository.save(any(MembershipPlan.class))).thenAnswer(inv -> {
            MembershipPlan p = inv.getArgument(0);
            p.setId(1L);
            p.setUuid(planUuid);
            return p;
        });

        MembershipPlanDto result = membershipPlanService.createPlan(request);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Primary Care Plus");
        assertThat(result.getPriceMonthly()).isEqualByComparingTo(new BigDecimal("99.00"));
        assertThat(result.isIncludesTelehealth()).isTrue();
        verify(membershipPlanRepository).save(any(MembershipPlan.class));
    }

    @Test
    @DisplayName("enrollPatient creates enrollment and cancels existing active enrollment")
    void enrollPatient_cancelsExistingAndCreatesNew() {
        EnrollPatientRequest request = new EnrollPatientRequest();
        request.setPatientId(100L);
        request.setStartDate(LocalDate.now());
        request.setBillingInterval("MONTHLY");

        PlanEnrollment existingEnrollment = PlanEnrollment.builder()
                .tenantId(1L).patientId(100L).planId(99L)
                .startDate(LocalDate.now().minusMonths(2))
                .status(PlanEnrollment.EnrollmentStatus.ACTIVE)
                .billingInterval(PlanEnrollment.BillingInterval.MONTHLY)
                .build();
        existingEnrollment.setId(4L);
        existingEnrollment.setUuid(UUID.randomUUID().toString());

        PlanEnrollment newEnrollment = PlanEnrollment.builder()
                .tenantId(1L).patientId(100L).planId(1L)
                .startDate(LocalDate.now())
                .status(PlanEnrollment.EnrollmentStatus.ACTIVE)
                .billingInterval(PlanEnrollment.BillingInterval.MONTHLY)
                .build();
        newEnrollment.setId(5L);
        newEnrollment.setUuid(enrollmentUuid);

        when(membershipPlanRepository.findByTenantIdAndUuid(1L, planUuid))
                .thenReturn(Optional.of(testPlan));
        when(planEnrollmentRepository.findByPatientIdAndTenantIdAndStatus(
                100L, 1L, PlanEnrollment.EnrollmentStatus.ACTIVE))
                .thenReturn(Optional.of(existingEnrollment));
        when(planEnrollmentRepository.save(any(PlanEnrollment.class)))
                .thenAnswer(inv -> {
                    PlanEnrollment e = inv.getArgument(0);
                    if (e.getId() == null) {
                        e.setId(5L);
                        e.setUuid(enrollmentUuid);
                    }
                    return e;
                });

        PlanEnrollmentDto result = membershipPlanService.enrollPatient(planUuid, request);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo("ACTIVE");
        assertThat(result.getPlanUuid()).isEqualTo(planUuid);
        // Save called twice: once to cancel old, once to create new
        verify(planEnrollmentRepository, times(2)).save(any(PlanEnrollment.class));
    }

    @Test
    @DisplayName("cancelEnrollment sets enrollment status to CANCELLED")
    void cancelEnrollment_setsStatusToCancelled() {
        when(planEnrollmentRepository.findByTenantIdAndUuid(1L, enrollmentUuid))
                .thenReturn(Optional.of(testEnrollment));
        when(planEnrollmentRepository.save(any(PlanEnrollment.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(membershipPlanRepository.findById(1L)).thenReturn(Optional.of(testPlan));

        PlanEnrollmentDto result = membershipPlanService.cancelEnrollment(enrollmentUuid);

        assertThat(result.getStatus()).isEqualTo("CANCELLED");
        assertThat(result.getEndDate()).isNotNull();
    }

    @Test
    @DisplayName("cancelEnrollment throws NOT_FOUND for unknown enrollment UUID")
    void cancelEnrollment_notFound_throws() {
        when(planEnrollmentRepository.findByTenantIdAndUuid(1L, enrollmentUuid))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> membershipPlanService.cancelEnrollment(enrollmentUuid))
                .isInstanceOf(PrimusException.class)
                .hasMessageContaining("Enrollment not found");
    }
}
