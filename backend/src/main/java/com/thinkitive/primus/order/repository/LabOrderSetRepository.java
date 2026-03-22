package com.thinkitive.primus.order.repository;

import com.thinkitive.primus.order.entity.LabOrderSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabOrderSetRepository extends JpaRepository<LabOrderSet, Long> {

    List<LabOrderSet> findByTenantIdAndArchiveFalse(Long tenantId);

    List<LabOrderSet> findByTenantIdAndIsActiveTrueAndArchiveFalse(Long tenantId);

    Optional<LabOrderSet> findByTenantIdAndUuid(Long tenantId, String uuid);

    Optional<LabOrderSet> findByTenantIdAndName(Long tenantId, String name);
}
