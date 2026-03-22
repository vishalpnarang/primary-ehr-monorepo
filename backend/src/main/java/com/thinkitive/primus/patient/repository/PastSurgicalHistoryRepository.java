package com.thinkitive.primus.patient.repository;

import com.thinkitive.primus.patient.entity.PastSurgicalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PastSurgicalHistoryRepository extends JpaRepository<PastSurgicalHistory, Long> {

    List<PastSurgicalHistory> findByPatientIdAndTenantId(Long patientId, Long tenantId);

    List<PastSurgicalHistory> findByPatientIdAndTenantIdAndArchiveFalse(Long patientId, Long tenantId);
}
