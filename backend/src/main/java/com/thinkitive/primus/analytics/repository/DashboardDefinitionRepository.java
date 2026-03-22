package com.thinkitive.primus.analytics.repository;

import com.thinkitive.primus.analytics.entity.DashboardDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DashboardDefinitionRepository extends JpaRepository<DashboardDefinition, Long> {

    List<DashboardDefinition> findByTenantIdAndIsActiveTrueAndArchiveFalseOrderByDisplayOrderAsc(Long tenantId);

    List<DashboardDefinition> findByTenantIdAndCategoryAndIsActiveTrueAndArchiveFalse(
            Long tenantId, DashboardDefinition.DashboardCategory category);

    Optional<DashboardDefinition> findByTenantIdAndUuid(Long tenantId, String uuid);
}
