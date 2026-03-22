package com.thinkitive.primus.encounter.repository;

import com.thinkitive.primus.encounter.entity.EncounterProcedure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EncounterProcedureRepository extends JpaRepository<EncounterProcedure, Long> {

    List<EncounterProcedure> findByTenantId(Long tenantId);

    List<EncounterProcedure> findByTenantIdAndArchiveFalse(Long tenantId);

    List<EncounterProcedure> findByEncounterIdAndArchiveFalse(Long encounterId);

    List<EncounterProcedure> findByEncounterIdAndTenantIdAndArchiveFalse(Long encounterId, Long tenantId);

    Optional<EncounterProcedure> findByTenantIdAndUuid(Long tenantId, String uuid);
}
