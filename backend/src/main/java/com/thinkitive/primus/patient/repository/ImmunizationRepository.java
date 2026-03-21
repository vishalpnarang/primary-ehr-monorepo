package com.thinkitive.primus.patient.repository;

import com.thinkitive.primus.patient.entity.Immunization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImmunizationRepository extends JpaRepository<Immunization, Long> {

    List<Immunization> findByPatientIdOrderByAdministeredDateDesc(Long patientId);
}
