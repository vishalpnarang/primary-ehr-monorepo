package com.thinkitive.primus.template.repository;

import com.thinkitive.primus.template.entity.SoapNoteTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SoapNoteTemplateRepository extends JpaRepository<SoapNoteTemplate, Long> {

    List<SoapNoteTemplate> findByTenantId(Long tenantId);

    List<SoapNoteTemplate> findByTenantIdAndArchiveFalse(Long tenantId);

    List<SoapNoteTemplate> findByTenantIdAndCategoryAndArchiveFalse(
            Long tenantId, SoapNoteTemplate.TemplateCategory category);

    Optional<SoapNoteTemplate> findByTenantIdAndIsDefaultTrueAndArchiveFalse(Long tenantId);

    Optional<SoapNoteTemplate> findByTenantIdAndUuid(Long tenantId, String uuid);
}
