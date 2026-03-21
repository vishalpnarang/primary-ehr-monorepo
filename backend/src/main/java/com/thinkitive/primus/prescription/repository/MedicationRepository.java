package com.thinkitive.primus.prescription.repository;

import com.thinkitive.primus.prescription.entity.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, Long> {

    List<Medication> findByPatientIdAndArchiveFalse(Long patientId);

    List<Medication> findByPatientIdAndStatus(Long patientId, Medication.MedicationStatus status);

    List<Medication> findByPatientIdAndIsControlledTrue(Long patientId);
}
