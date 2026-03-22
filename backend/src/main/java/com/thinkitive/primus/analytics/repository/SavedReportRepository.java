package com.thinkitive.primus.analytics.repository;

import com.thinkitive.primus.analytics.entity.SavedReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedReportRepository extends JpaRepository<SavedReport, Long> {

    List<SavedReport> findByTenantIdAndArchiveFalse(Long tenantId);

    List<SavedReport> findByTenantIdAndCreatedByUserAndArchiveFalse(Long tenantId, String createdByUser);

    List<SavedReport> findByTenantIdAndIsSharedTrueAndArchiveFalse(Long tenantId);

    Optional<SavedReport> findByTenantIdAndUuid(Long tenantId, String uuid);
}
