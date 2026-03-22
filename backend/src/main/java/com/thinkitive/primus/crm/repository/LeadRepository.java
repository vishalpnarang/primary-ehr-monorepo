package com.thinkitive.primus.crm.repository;

import com.thinkitive.primus.crm.entity.Lead;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {

    Page<Lead> findByTenantIdAndArchiveFalse(Long tenantId, Pageable pageable);

    Page<Lead> findByTenantIdAndStatusAndArchiveFalse(
            Long tenantId, Lead.LeadStatus status, Pageable pageable);

    Page<Lead> findByTenantIdAndAssignedToAndArchiveFalse(
            Long tenantId, String assignedTo, Pageable pageable);

    Optional<Lead> findByTenantIdAndUuid(Long tenantId, String uuid);
}
