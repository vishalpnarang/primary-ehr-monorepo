package com.thinkitive.primus.patient.repository;

import com.thinkitive.primus.patient.entity.CareGap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareGapRepository extends JpaRepository<CareGap, Long> {

    List<CareGap> findByPatientIdAndArchiveFalse(Long patientId);

    List<CareGap> findByPatientIdAndStatus(Long patientId, CareGap.CareGapStatus status);
}
