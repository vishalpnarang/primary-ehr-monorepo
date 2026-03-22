package com.thinkitive.primus.order.repository;

import com.thinkitive.primus.order.entity.LabCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabCatalogRepository extends JpaRepository<LabCatalog, Long> {

    List<LabCatalog> findByTenantIdAndArchiveFalse(Long tenantId);

    List<LabCatalog> findByTenantIdAndIsActiveTrueAndArchiveFalse(Long tenantId);

    List<LabCatalog> findByTenantIdAndTestNameContainingIgnoreCaseAndArchiveFalse(Long tenantId, String query);

    List<LabCatalog> findByTenantIdAndDepartmentAndArchiveFalse(Long tenantId, String department);

    Optional<LabCatalog> findByTenantIdAndUuid(Long tenantId, String uuid);

    Optional<LabCatalog> findByTenantIdAndTestCode(Long tenantId, String testCode);
}
