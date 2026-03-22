package com.thinkitive.primus.crm.repository;

import com.thinkitive.primus.crm.entity.Campaign;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    Page<Campaign> findByTenantIdAndArchiveFalse(Long tenantId, Pageable pageable);

    Page<Campaign> findByTenantIdAndStatusAndArchiveFalse(
            Long tenantId, Campaign.CampaignStatus status, Pageable pageable);

    Optional<Campaign> findByTenantIdAndUuid(Long tenantId, String uuid);
}
