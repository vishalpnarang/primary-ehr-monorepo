package com.thinkitive.primus.scheduling.repository;

import com.thinkitive.primus.scheduling.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByTenantIdAndDateAndProviderId(Long tenantId, LocalDate date, Long providerId);

    List<Appointment> findByTenantIdAndPatientId(Long tenantId, Long patientId);

    List<Appointment> findByTenantIdAndDate(Long tenantId, LocalDate date);

    List<Appointment> findByTenantIdAndPatientIdOrderByDateDescStartTimeDesc(Long tenantId, Long patientId);

    List<Appointment> findByTenantIdAndDateBetweenAndProviderId(
        Long tenantId, LocalDate startDate, LocalDate endDate, Long providerId
    );
}
