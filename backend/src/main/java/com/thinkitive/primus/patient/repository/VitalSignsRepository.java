package com.thinkitive.primus.patient.repository;

import com.thinkitive.primus.patient.entity.VitalSigns;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VitalSignsRepository extends JpaRepository<VitalSigns, Long> {

    Page<VitalSigns> findByPatientIdOrderByRecordedAtDesc(Long patientId, Pageable pageable);

    Optional<VitalSigns> findTopByPatientIdOrderByRecordedAtDesc(Long patientId);

    List<VitalSigns> findByEncounterId(Long encounterId);
}
