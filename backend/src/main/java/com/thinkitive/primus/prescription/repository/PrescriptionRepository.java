package com.thinkitive.primus.prescription.repository;

import com.thinkitive.primus.prescription.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    List<Prescription> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    List<Prescription> findByTenantIdAndProviderIdAndStatus(
        Long tenantId, Long providerId, Prescription.PrescriptionStatus status
    );

    List<Prescription> findByMedicationId(Long medicationId);
}
