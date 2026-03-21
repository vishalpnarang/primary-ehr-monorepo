package com.thinkitive.primus.patient.repository;

import com.thinkitive.primus.patient.entity.Allergy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllergyRepository extends JpaRepository<Allergy, Long> {

    List<Allergy> findByPatientIdAndArchiveFalse(Long patientId);
}
