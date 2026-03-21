package com.thinkitive.primus.patient.repository;

import com.thinkitive.primus.patient.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByTenantIdAndUuid(Long tenantId, UUID uuid);

    Page<Patient> findByTenantIdAndArchiveFalse(Long tenantId, Pageable pageable);

    long countByTenantIdAndStatus(Long tenantId, Patient.PatientStatus status);

    List<Patient> findByTenantIdAndCreatedAtBetween(Long tenantId, Instant start, Instant end);

    Optional<Patient> findByTenantIdAndMrn(Long tenantId, String mrn);

    @Query("""
        SELECT p FROM Patient p
        WHERE p.tenantId = :tenantId
          AND p.archive = false
          AND (
            LOWER(p.firstName) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(p.mrn) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(p.email) LIKE LOWER(CONCAT('%', :query, '%'))
          )
        """)
    Page<Patient> searchByName(
        @Param("tenantId") Long tenantId,
        @Param("query") String query,
        Pageable pageable
    );

    boolean existsByTenantIdAndMrn(Long tenantId, String mrn);
}
