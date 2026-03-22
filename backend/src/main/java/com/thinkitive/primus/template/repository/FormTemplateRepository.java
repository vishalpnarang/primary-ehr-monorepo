package com.thinkitive.primus.template.repository;

import com.thinkitive.primus.template.entity.FormTemplate;
import com.thinkitive.primus.template.entity.FormTemplate.TemplateCategory;
import com.thinkitive.primus.template.entity.FormTemplate.TemplateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FormTemplateRepository extends JpaRepository<FormTemplate, Long> {

    Optional<FormTemplate> findByTenantIdAndUuid(Long tenantId, String uuid);

    List<FormTemplate> findByTenantIdAndArchiveFalseOrderByCreatedAtDesc(Long tenantId);

    List<FormTemplate> findByTenantIdAndCategoryAndStatusAndArchiveFalseOrderByCreatedAtDesc(
            Long tenantId, TemplateCategory category, TemplateStatus status);

    /** List templates with optional category and status filters — both can be null. */
    @Query("""
        SELECT t FROM FormTemplate t
        WHERE t.tenantId = :tenantId
          AND t.archive  = false
          AND (:category IS NULL OR t.category = :category)
          AND (:status   IS NULL OR t.status   = :status)
        ORDER BY t.createdAt DESC
        """)
    List<FormTemplate> findFiltered(
            @Param("tenantId") Long tenantId,
            @Param("category") TemplateCategory category,
            @Param("status")   TemplateStatus status
    );

    boolean existsByTenantIdAndNameAndVersion(Long tenantId, String name, Integer version);
}
