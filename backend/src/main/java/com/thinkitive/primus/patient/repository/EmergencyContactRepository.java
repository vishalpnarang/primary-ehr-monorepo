package com.thinkitive.primus.patient.repository;

import com.thinkitive.primus.patient.entity.EmergencyContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> {

    List<EmergencyContact> findByPatientIdAndTenantId(Long patientId, Long tenantId);

    List<EmergencyContact> findByPatientIdAndTenantIdAndArchiveFalse(Long patientId, Long tenantId);

    Optional<EmergencyContact> findByPatientIdAndIsPrimaryTrueAndTenantId(Long patientId, Long tenantId);
}
