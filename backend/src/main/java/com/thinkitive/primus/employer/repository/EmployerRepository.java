package com.thinkitive.primus.employer.repository;

import com.thinkitive.primus.employer.entity.Employer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployerRepository extends JpaRepository<Employer, Long> {

    Page<Employer> findByTenantIdAndArchiveFalse(Long tenantId, Pageable pageable);

    Optional<Employer> findByTenantIdAndUuid(Long tenantId, String uuid);

    boolean existsByTenantIdAndTaxIdAndArchiveFalse(Long tenantId, String taxId);
}
