package com.thinkitive.primus.billing.repository;

import com.thinkitive.primus.billing.entity.Claim;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    Page<Claim> findByTenantIdAndPatientId(Long tenantId, Long patientId, Pageable pageable);

    List<Claim> findByTenantIdAndStatus(Long tenantId, Claim.ClaimStatus status);

    Page<Claim> findByTenantIdAndStatus(Long tenantId, Claim.ClaimStatus status, Pageable pageable);

    List<Claim> findByTenantId(Long tenantId);

    Page<Claim> findByTenantId(Long tenantId, Pageable pageable);

    Optional<Claim> findByTenantIdAndUuid(Long tenantId, UUID uuid);

    List<Claim> findByEncounterId(Long encounterId);

    List<Claim> findByTenantIdAndDateOfServiceBetween(Long tenantId, LocalDate startDate, LocalDate endDate);

    List<Claim> findByTenantIdAndProviderIdAndStatus(Long tenantId, Long providerId, Claim.ClaimStatus status);
}
