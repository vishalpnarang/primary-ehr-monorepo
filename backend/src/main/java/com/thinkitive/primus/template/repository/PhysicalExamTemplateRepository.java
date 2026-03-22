package com.thinkitive.primus.template.repository;

import com.thinkitive.primus.template.entity.PhysicalExamTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PhysicalExamTemplateRepository extends JpaRepository<PhysicalExamTemplate, Long> {

    List<PhysicalExamTemplate> findByTenantId(Long tenantId);

    List<PhysicalExamTemplate> findByTenantIdAndArchiveFalse(Long tenantId);

    Optional<PhysicalExamTemplate> findByTenantIdAndIsDefaultTrueAndArchiveFalse(Long tenantId);

    Optional<PhysicalExamTemplate> findByTenantIdAndUuid(Long tenantId, String uuid);
}
