package com.thinkitive.primus.careplan.repository;

import com.thinkitive.primus.careplan.entity.CarePlanActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarePlanActivityRepository extends JpaRepository<CarePlanActivity, Long> {

    List<CarePlanActivity> findByTenantId(Long tenantId);

    List<CarePlanActivity> findByTenantIdAndArchiveFalse(Long tenantId);

    List<CarePlanActivity> findByGoalIdAndArchiveFalse(Long goalId);

    List<CarePlanActivity> findByGoalIdAndTenantIdAndArchiveFalse(Long goalId, Long tenantId);

    List<CarePlanActivity> findByAssignedToAndTenantIdAndArchiveFalse(String assignedTo, Long tenantId);

    Optional<CarePlanActivity> findByTenantIdAndUuid(Long tenantId, String uuid);
}
