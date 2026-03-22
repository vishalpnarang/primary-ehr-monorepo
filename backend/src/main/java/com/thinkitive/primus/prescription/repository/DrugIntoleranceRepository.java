package com.thinkitive.primus.prescription.repository;

import com.thinkitive.primus.prescription.entity.DrugIntolerance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DrugIntoleranceRepository extends JpaRepository<DrugIntolerance, Long> {

    List<DrugIntolerance> findByPatientIdAndTenantIdAndArchiveFalse(Long patientId, Long tenantId);

    Optional<DrugIntolerance> findByTenantIdAndUuid(Long tenantId, String uuid);
}
