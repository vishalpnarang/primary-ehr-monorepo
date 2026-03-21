package com.thinkitive.primus.encounter.repository;

import com.thinkitive.primus.encounter.entity.Encounter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EncounterRepository extends JpaRepository<Encounter, Long> {

    Optional<Encounter> findByTenantIdAndUuid(Long tenantId, String uuid);

    Page<Encounter> findByTenantIdAndPatientIdOrderByDateDesc(Long tenantId, Long patientId, Pageable pageable);

    List<Encounter> findByTenantIdAndPatientIdAndDateBetween(
        Long tenantId, Long patientId, LocalDate startDate, LocalDate endDate
    );

    Optional<Encounter> findByAppointmentId(Long appointmentId);

    List<Encounter> findByTenantIdAndProviderIdAndDate(Long tenantId, Long providerId, LocalDate date);

    List<Encounter> findByTenantIdAndProviderIdAndStatusIn(Long tenantId, Long providerId, List<Encounter.EncounterStatus> statuses);

    List<Encounter> findByTenantIdAndDateBetween(Long tenantId, LocalDate startDate, LocalDate endDate);
}
