package com.thinkitive.primus.template.repository;

import com.thinkitive.primus.template.entity.FormSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FormSubmissionRepository extends JpaRepository<FormSubmission, Long> {

    Optional<FormSubmission> findByTenantIdAndUuid(Long tenantId, String uuid);

    List<FormSubmission> findByTemplateIdAndTenantIdAndArchiveFalseOrderByCreatedAtDesc(
            Long templateId, Long tenantId);

    List<FormSubmission> findByPatientIdAndTenantIdAndArchiveFalseOrderByCreatedAtDesc(
            Long patientId, Long tenantId);
}
