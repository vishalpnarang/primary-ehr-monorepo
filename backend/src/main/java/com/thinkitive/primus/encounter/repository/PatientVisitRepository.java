package com.thinkitive.primus.encounter.repository;

import com.thinkitive.primus.encounter.entity.PatientVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientVisitRepository extends JpaRepository<PatientVisit, Long> {

    List<PatientVisit> findByTenantId(Long tenantId);

    List<PatientVisit> findByTenantIdAndArchiveFalse(Long tenantId);

    List<PatientVisit> findByPatientIdAndTenantIdAndArchiveFalse(Long patientId, Long tenantId);

    Optional<PatientVisit> findByEncounterIdAndTenantIdAndArchiveFalse(Long encounterId, Long tenantId);

    Optional<PatientVisit> findByAppointmentIdAndTenantIdAndArchiveFalse(Long appointmentId, Long tenantId);

    Optional<PatientVisit> findByTenantIdAndUuid(Long tenantId, String uuid);
}
