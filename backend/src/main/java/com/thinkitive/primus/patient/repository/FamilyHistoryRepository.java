package com.thinkitive.primus.patient.repository;

import com.thinkitive.primus.patient.entity.FamilyHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FamilyHistoryRepository extends JpaRepository<FamilyHistory, Long> {

    List<FamilyHistory> findByPatientIdAndTenantId(Long patientId, Long tenantId);

    List<FamilyHistory> findByPatientIdAndTenantIdAndArchiveFalse(Long patientId, Long tenantId);
}
