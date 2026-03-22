package com.thinkitive.primus.employer.repository;

import com.thinkitive.primus.employer.entity.EmployerPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployerPlanRepository extends JpaRepository<EmployerPlan, Long> {

    List<EmployerPlan> findByEmployerIdAndArchiveFalse(Long employerId);

    Optional<EmployerPlan> findByTenantIdAndUuid(Long tenantId, String uuid);
}
