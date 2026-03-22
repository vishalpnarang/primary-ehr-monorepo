package com.thinkitive.primus.patient.repository;

import com.thinkitive.primus.patient.entity.PatientFlag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientFlagRepository extends JpaRepository<PatientFlag, Long> {

    List<PatientFlag> findByPatientIdAndActiveAndTenantId(Long patientId, boolean active, Long tenantId);

    List<PatientFlag> findByPatientIdAndTenantId(Long patientId, Long tenantId);

    List<PatientFlag> findByPatientIdAndFlagTypeAndTenantId(
        Long patientId,
        PatientFlag.FlagType flagType,
        Long tenantId
    );
}
