package com.thinkitive.primus.affiliate.repository;

import com.thinkitive.primus.affiliate.entity.Affiliate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AffiliateRepository extends JpaRepository<Affiliate, Long> {

    Page<Affiliate> findByTenantIdAndArchiveFalse(Long tenantId, Pageable pageable);

    Page<Affiliate> findByTenantIdAndStatusAndArchiveFalse(Long tenantId, String status, Pageable pageable);

    Optional<Affiliate> findByTenantIdAndUuid(Long tenantId, String uuid);
}
