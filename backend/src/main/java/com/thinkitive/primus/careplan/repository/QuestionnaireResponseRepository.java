package com.thinkitive.primus.careplan.repository;

import com.thinkitive.primus.careplan.entity.QuestionnaireResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionnaireResponseRepository extends JpaRepository<QuestionnaireResponse, Long> {

    List<QuestionnaireResponse> findByTenantIdAndArchiveFalse(Long tenantId);

    List<QuestionnaireResponse> findByPatientIdAndTenantIdAndArchiveFalse(Long patientId, Long tenantId);

    List<QuestionnaireResponse> findByQuestionnaireIdAndTenantIdAndArchiveFalse(
            Long questionnaireId, Long tenantId);

    List<QuestionnaireResponse> findByEncounterIdAndTenantIdAndArchiveFalse(Long encounterId, Long tenantId);

    Optional<QuestionnaireResponse> findByTenantIdAndUuid(Long tenantId, String uuid);
}
