package com.thinkitive.primus.billing.service;

import com.thinkitive.primus.billing.dto.*;
import com.thinkitive.primus.billing.entity.MembershipPlan;
import com.thinkitive.primus.billing.entity.PlanEnrollment;
import com.thinkitive.primus.billing.repository.MembershipPlanRepository;
import com.thinkitive.primus.billing.repository.PlanEnrollmentRepository;
import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MembershipPlanServiceImpl implements MembershipPlanService {

    private final MembershipPlanRepository membershipPlanRepository;
    private final PlanEnrollmentRepository planEnrollmentRepository;

    // ── Plans ─────────────────────────────────────────────────────────────────

    @Override
    public List<MembershipPlanDto> getPlans() {
        Long tenantId = TenantContext.getTenantId();
        return membershipPlanRepository
                .findByTenantIdAndIsActiveTrueAndArchiveFalse(tenantId)
                .stream()
                .map(this::toPlanDto)
                .toList();
    }

    @Override
    @Transactional
    public MembershipPlanDto createPlan(CreateMembershipPlanRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Creating membership plan tenant={} name={}", tenantId, request.getName());

        MembershipPlan plan = MembershipPlan.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .description(request.getDescription())
                .priceMonthly(request.getPriceMonthly())
                .priceAnnual(request.getPriceAnnual())
                .features(request.getFeatures())
                .maxVisitsPerYear(request.getMaxVisitsPerYear())
                .includesTelehealth(request.isIncludesTelehealth())
                .isActive(true)
                .build();

        MembershipPlan saved = membershipPlanRepository.save(plan);
        log.info("Membership plan created uuid={}", saved.getUuid());
        return toPlanDto(saved);
    }

    // ── Enrollments ───────────────────────────────────────────────────────────

    @Override
    @Transactional
    public PlanEnrollmentDto enrollPatient(String planUuid, EnrollPatientRequest request) {
        Long tenantId = TenantContext.getTenantId();
        MembershipPlan plan = requirePlan(tenantId, planUuid);
        log.info("Enrolling patient={} in plan={}", request.getPatientId(), planUuid);

        // Cancel any existing active enrollment
        planEnrollmentRepository
                .findByPatientIdAndTenantIdAndStatus(request.getPatientId(), tenantId,
                        PlanEnrollment.EnrollmentStatus.ACTIVE)
                .ifPresent(existing -> {
                    existing.setStatus(PlanEnrollment.EnrollmentStatus.CANCELLED);
                    existing.setEndDate(LocalDate.now());
                    planEnrollmentRepository.save(existing);
                    log.info("Previous enrollment cancelled uuid={}", existing.getUuid());
                });

        PlanEnrollment.BillingInterval interval = parseBillingInterval(request.getBillingInterval());

        PlanEnrollment enrollment = PlanEnrollment.builder()
                .tenantId(tenantId)
                .patientId(request.getPatientId())
                .planId(plan.getId())
                .startDate(request.getStartDate())
                .status(PlanEnrollment.EnrollmentStatus.ACTIVE)
                .billingInterval(interval)
                .stripeSubscriptionId(request.getStripeSubscriptionId())
                .build();

        PlanEnrollment saved = planEnrollmentRepository.save(enrollment);
        log.info("Patient enrolled uuid={}", saved.getUuid());
        return toEnrollmentDto(saved, plan.getUuid());
    }

    @Override
    @Transactional
    public PlanEnrollmentDto cancelEnrollment(String enrollmentUuid) {
        Long tenantId = TenantContext.getTenantId();
        PlanEnrollment enrollment = planEnrollmentRepository
                .findByTenantIdAndUuid(tenantId, enrollmentUuid)
                .filter(e -> !e.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Enrollment not found: " + enrollmentUuid));

        enrollment.setStatus(PlanEnrollment.EnrollmentStatus.CANCELLED);
        enrollment.setEndDate(LocalDate.now());
        PlanEnrollment saved = planEnrollmentRepository.save(enrollment);

        MembershipPlan plan = membershipPlanRepository.findById(saved.getPlanId())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND, "Plan not found"));

        log.info("Enrollment cancelled uuid={}", enrollmentUuid);
        return toEnrollmentDto(saved, plan.getUuid());
    }

    @Override
    public PlanEnrollmentDto getPatientEnrollment(Long patientId) {
        Long tenantId = TenantContext.getTenantId();
        PlanEnrollment enrollment = planEnrollmentRepository
                .findByPatientIdAndTenantIdAndStatus(patientId, tenantId,
                        PlanEnrollment.EnrollmentStatus.ACTIVE)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "No active enrollment found for patient: " + patientId));

        MembershipPlan plan = membershipPlanRepository.findById(enrollment.getPlanId())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND, "Plan not found"));

        return toEnrollmentDto(enrollment, plan.getUuid());
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private MembershipPlan requirePlan(Long tenantId, String uuid) {
        return membershipPlanRepository.findByTenantIdAndUuid(tenantId, uuid)
                .filter(p -> !p.isArchive())
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Membership plan not found: " + uuid));
    }

    private PlanEnrollment.BillingInterval parseBillingInterval(String value) {
        if (value == null) return PlanEnrollment.BillingInterval.MONTHLY;
        try {
            return PlanEnrollment.BillingInterval.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown billing interval '{}', defaulting to MONTHLY", value);
            return PlanEnrollment.BillingInterval.MONTHLY;
        }
    }

    private MembershipPlanDto toPlanDto(MembershipPlan p) {
        return MembershipPlanDto.builder()
                .uuid(p.getUuid())
                .name(p.getName())
                .description(p.getDescription())
                .priceMonthly(p.getPriceMonthly())
                .priceAnnual(p.getPriceAnnual())
                .features(p.getFeatures())
                .maxVisitsPerYear(p.getMaxVisitsPerYear())
                .includesTelehealth(p.isIncludesTelehealth())
                .isActive(p.isActive())
                .createdAt(p.getCreatedAt())
                .modifiedAt(p.getModifiedAt())
                .build();
    }

    private PlanEnrollmentDto toEnrollmentDto(PlanEnrollment e, String planUuid) {
        return PlanEnrollmentDto.builder()
                .uuid(e.getUuid())
                .patientId(e.getPatientId())
                .planUuid(planUuid)
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .status(e.getStatus() != null ? e.getStatus().name() : null)
                .billingInterval(e.getBillingInterval() != null ? e.getBillingInterval().name() : null)
                .stripeSubscriptionId(e.getStripeSubscriptionId())
                .createdAt(e.getCreatedAt())
                .modifiedAt(e.getModifiedAt())
                .build();
    }
}
