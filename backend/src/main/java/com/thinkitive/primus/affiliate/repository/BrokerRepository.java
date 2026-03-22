package com.thinkitive.primus.affiliate.repository;

import com.thinkitive.primus.affiliate.entity.Broker;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BrokerRepository extends JpaRepository<Broker, Long> {

    Page<Broker> findByTenantIdAndArchiveFalse(Long tenantId, Pageable pageable);

    Page<Broker> findByTenantIdAndStatusAndArchiveFalse(Long tenantId, String status, Pageable pageable);

    Optional<Broker> findByTenantIdAndUuid(Long tenantId, String uuid);

    boolean existsByTenantIdAndLicenseNumberAndArchiveFalse(Long tenantId, String licenseNumber);
}
