package com.thinkitive.primus.template.repository;

import com.thinkitive.primus.template.entity.RosTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RosTemplateRepository extends JpaRepository<RosTemplate, Long> {

    List<RosTemplate> findByTenantId(Long tenantId);

    List<RosTemplate> findByTenantIdAndArchiveFalse(Long tenantId);

    Optional<RosTemplate> findByTenantIdAndIsDefaultTrueAndArchiveFalse(Long tenantId);

    Optional<RosTemplate> findByTenantIdAndUuid(Long tenantId, String uuid);
}
