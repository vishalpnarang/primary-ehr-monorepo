package com.thinkitive.primus.patient.repository;

import com.thinkitive.primus.patient.entity.SocialHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SocialHistoryRepository extends JpaRepository<SocialHistory, Long> {

    Optional<SocialHistory> findByPatientIdAndTenantId(Long patientId, Long tenantId);
}
