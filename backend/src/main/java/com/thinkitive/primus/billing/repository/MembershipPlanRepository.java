package com.thinkitive.primus.billing.repository;

import com.thinkitive.primus.billing.entity.MembershipPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipPlanRepository extends JpaRepository<MembershipPlan, Long> {

    List<MembershipPlan> findByTenantIdAndIsActiveTrueAndArchiveFalse(Long tenantId);

    List<MembershipPlan> findByTenantIdAndArchiveFalse(Long tenantId);

    Optional<MembershipPlan> findByTenantIdAndUuid(Long tenantId, String uuid);
}
