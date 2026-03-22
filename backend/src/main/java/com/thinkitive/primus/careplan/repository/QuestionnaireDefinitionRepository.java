package com.thinkitive.primus.careplan.repository;

import com.thinkitive.primus.careplan.entity.QuestionnaireDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionnaireDefinitionRepository extends JpaRepository<QuestionnaireDefinition, Long> {

    List<QuestionnaireDefinition> findByTenantIdAndArchiveFalse(Long tenantId);

    List<QuestionnaireDefinition> findByTenantIdAndIsPublishedTrueAndArchiveFalse(Long tenantId);

    List<QuestionnaireDefinition> findByTenantIdAndCategoryAndArchiveFalse(
            Long tenantId, QuestionnaireDefinition.QuestionnaireCategory category);

    /** System-level questionnaires have no tenant (tenant_id IS NULL). */
    List<QuestionnaireDefinition> findByTenantIdIsNullAndIsPublishedTrueAndArchiveFalse();

    Optional<QuestionnaireDefinition> findByTenantIdAndUuid(Long tenantId, String uuid);

    Optional<QuestionnaireDefinition> findByUuidAndArchiveFalse(String uuid);
}
