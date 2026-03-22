package com.thinkitive.primus.careplan.repository;

import com.thinkitive.primus.careplan.entity.CarePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarePlanRepository extends JpaRepository<CarePlan, Long> {

    List<CarePlan> findByTenantId(Long tenantId);

    List<CarePlan> findByTenantIdAndArchiveFalse(Long tenantId);

    List<CarePlan> findByPatientIdAndTenantIdAndArchiveFalse(Long patientId, Long tenantId);

    List<CarePlan> findByPatientIdAndTenantIdAndStatusAndArchiveFalse(
            Long patientId, Long tenantId, CarePlan.CarePlanStatus status);

    Optional<CarePlan> findByTenantIdAndUuid(Long tenantId, String uuid);
}
