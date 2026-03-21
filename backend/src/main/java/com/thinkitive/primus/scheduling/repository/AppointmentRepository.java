package com.thinkitive.primus.scheduling.repository;

import com.thinkitive.primus.scheduling.entity.Appointment;
import com.thinkitive.primus.scheduling.entity.Appointment.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Optional<Appointment> findByTenantIdAndUuid(Long tenantId, UUID uuid);

    List<Appointment> findByTenantIdAndDateAndProviderId(Long tenantId, LocalDate date, Long providerId);

    List<Appointment> findByTenantIdAndPatientId(Long tenantId, Long patientId);

    List<Appointment> findByTenantIdAndDate(Long tenantId, LocalDate date);

    List<Appointment> findByTenantIdAndPatientIdOrderByDateDescStartTimeDesc(Long tenantId, Long patientId);

    List<Appointment> findByTenantIdAndDateBetween(Long tenantId, LocalDate startDate, LocalDate endDate);

    List<Appointment> findByTenantIdAndDateBetweenAndProviderId(
        Long tenantId, LocalDate startDate, LocalDate endDate, Long providerId
    );

    /** Paginated list with optional provider + status + date filters (nulls ignored). */
    @Query("""
        SELECT a FROM Appointment a
        WHERE a.tenantId = :tenantId
          AND a.archive  = false
          AND (:providerId IS NULL OR a.providerId = :providerId)
          AND (:status    IS NULL OR a.status      = :status)
          AND (:date      IS NULL OR a.date        = :date)
        ORDER BY a.date DESC, a.startTime ASC
        """)
    Page<Appointment> filterAppointments(
        @Param("tenantId")   Long tenantId,
        @Param("providerId") Long providerId,
        @Param("status")     AppointmentStatus status,
        @Param("date")       LocalDate date,
        Pageable pageable
    );

    /** True when the provider already has a non-cancelled appointment that overlaps [startTime, endTime). */
    @Query("""
        SELECT COUNT(a) > 0 FROM Appointment a
        WHERE a.tenantId   = :tenantId
          AND a.providerId = :providerId
          AND a.date       = :date
          AND a.startTime  < :endTime
          AND a.endTime    > :startTime
          AND a.status NOT IN :excluded
        """)
    boolean hasConflict(
        @Param("tenantId")   Long tenantId,
        @Param("providerId") Long providerId,
        @Param("date")       LocalDate date,
        @Param("startTime")  LocalTime startTime,
        @Param("endTime")    LocalTime endTime,
        @Param("excluded")   List<AppointmentStatus> excluded
    );
}
