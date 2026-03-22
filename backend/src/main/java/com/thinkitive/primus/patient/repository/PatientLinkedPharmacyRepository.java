package com.thinkitive.primus.patient.repository;

import com.thinkitive.primus.patient.entity.PatientLinkedPharmacy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientLinkedPharmacyRepository extends JpaRepository<PatientLinkedPharmacy, Long> {

    List<PatientLinkedPharmacy> findByPatientIdAndTenantId(Long patientId, Long tenantId);

    Optional<PatientLinkedPharmacy> findByPatientIdAndIsPreferredTrueAndTenantId(Long patientId, Long tenantId);

    boolean existsByPatientIdAndPharmacyId(Long patientId, Long pharmacyId);
}
