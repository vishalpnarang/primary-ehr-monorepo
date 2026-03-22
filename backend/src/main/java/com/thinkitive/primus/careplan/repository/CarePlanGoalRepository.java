package com.thinkitive.primus.careplan.repository;

import com.thinkitive.primus.careplan.entity.CarePlanGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarePlanGoalRepository extends JpaRepository<CarePlanGoal, Long> {

    List<CarePlanGoal> findByTenantId(Long tenantId);

    List<CarePlanGoal> findByTenantIdAndArchiveFalse(Long tenantId);

    List<CarePlanGoal> findByCarePlanIdAndArchiveFalse(Long carePlanId);

    List<CarePlanGoal> findByCarePlanIdAndTenantIdAndArchiveFalse(Long carePlanId, Long tenantId);

    Optional<CarePlanGoal> findByTenantIdAndUuid(Long tenantId, String uuid);
}
