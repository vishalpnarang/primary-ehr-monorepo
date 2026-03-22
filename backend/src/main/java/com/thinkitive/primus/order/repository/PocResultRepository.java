package com.thinkitive.primus.order.repository;

import com.thinkitive.primus.order.entity.PocResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PocResultRepository extends JpaRepository<PocResult, Long> {

    List<PocResult> findByPatientIdAndTenantIdAndArchiveFalseOrderByPerformedAtDesc(
            Long patientId, Long tenantId);

    List<PocResult> findByEncounterIdAndTenantIdAndArchiveFalse(Long encounterId, Long tenantId);

    List<PocResult> findByPocTestIdAndTenantIdAndArchiveFalse(Long pocTestId, Long tenantId);

    Optional<PocResult> findByTenantIdAndUuid(Long tenantId, String uuid);
}
