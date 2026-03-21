package com.thinkitive.primus.patient.repository;

import com.thinkitive.primus.patient.entity.PatientInsurance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientInsuranceRepository extends JpaRepository<PatientInsurance, Long> {

    List<PatientInsurance> findByPatientIdAndArchiveFalse(Long patientId);

    Optional<PatientInsurance> findByPatientIdAndIsPrimaryTrue(Long patientId);
}
