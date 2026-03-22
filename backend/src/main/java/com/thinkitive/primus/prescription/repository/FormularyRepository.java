package com.thinkitive.primus.prescription.repository;

import com.thinkitive.primus.prescription.entity.Formulary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FormularyRepository extends JpaRepository<Formulary, Long> {

    List<Formulary> findByTenantIdAndIsActiveTrueAndArchiveFalse(Long tenantId);

    List<Formulary> findByTenantIdAndDrugNameContainingIgnoreCaseAndArchiveFalse(
            Long tenantId, String query);

    List<Formulary> findByTenantIdAndDrugClassAndArchiveFalse(Long tenantId, String drugClass);

    Optional<Formulary> findByTenantIdAndUuid(Long tenantId, String uuid);

    Optional<Formulary> findByTenantIdAndNdc(Long tenantId, String ndc);

    Optional<Formulary> findByTenantIdAndRxnormCode(Long tenantId, String rxnormCode);
}
