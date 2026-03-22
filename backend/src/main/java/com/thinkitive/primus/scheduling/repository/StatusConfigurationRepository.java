package com.thinkitive.primus.scheduling.repository;

import com.thinkitive.primus.scheduling.entity.StatusConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StatusConfigurationRepository extends JpaRepository<StatusConfiguration, Long> {

    List<StatusConfiguration> findByTenantId(Long tenantId);

    List<StatusConfiguration> findByTenantIdAndArchiveFalseOrderByDisplayOrderAsc(Long tenantId);

    List<StatusConfiguration> findByFromStatusAndTenantId(String fromStatus, Long tenantId);

    Optional<StatusConfiguration> findByNameAndFromStatusAndToStatusAndTenantId(
        String name,
        String fromStatus,
        String toStatus,
        Long tenantId
    );
}
