package com.thinkitive.primus.billing.repository;

import com.thinkitive.primus.billing.entity.PlanEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlanEnrollmentRepository extends JpaRepository<PlanEnrollment, Long> {

    List<PlanEnrollment> findByPatientIdAndTenantIdAndArchiveFalse(Long patientId, Long tenantId);

    Optional<PlanEnrollment> findByPatientIdAndTenantIdAndStatus(
            Long patientId, Long tenantId, PlanEnrollment.EnrollmentStatus status);

    List<PlanEnrollment> findByPlanIdAndTenantIdAndArchiveFalse(Long planId, Long tenantId);

    Optional<PlanEnrollment> findByTenantIdAndUuid(Long tenantId, String uuid);
}
