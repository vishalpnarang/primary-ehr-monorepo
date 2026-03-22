package com.thinkitive.primus.patient.repository;

import com.thinkitive.primus.patient.entity.PastMedicalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PastMedicalHistoryRepository extends JpaRepository<PastMedicalHistory, Long> {

    List<PastMedicalHistory> findByPatientIdAndTenantId(Long patientId, Long tenantId);

    List<PastMedicalHistory> findByPatientIdAndTenantIdAndArchiveFalse(Long patientId, Long tenantId);

    List<PastMedicalHistory> findByPatientIdAndStatusAndTenantId(
        Long patientId,
        PastMedicalHistory.ConditionStatus status,
        Long tenantId
    );
}
