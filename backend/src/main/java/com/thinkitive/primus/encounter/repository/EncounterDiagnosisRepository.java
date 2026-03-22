package com.thinkitive.primus.encounter.repository;

import com.thinkitive.primus.encounter.entity.EncounterDiagnosis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EncounterDiagnosisRepository extends JpaRepository<EncounterDiagnosis, Long> {

    List<EncounterDiagnosis> findByTenantId(Long tenantId);

    List<EncounterDiagnosis> findByTenantIdAndArchiveFalse(Long tenantId);

    List<EncounterDiagnosis> findByEncounterIdAndArchiveFalseOrderBySequenceAsc(Long encounterId);

    List<EncounterDiagnosis> findByEncounterIdAndTenantIdAndArchiveFalse(Long encounterId, Long tenantId);

    Optional<EncounterDiagnosis> findByTenantIdAndUuid(Long tenantId, String uuid);

    boolean existsByEncounterIdAndIcd10CodeAndArchiveFalse(Long encounterId, String icd10Code);

    void deleteByEncounterIdAndTenantId(Long encounterId, Long tenantId);
}
