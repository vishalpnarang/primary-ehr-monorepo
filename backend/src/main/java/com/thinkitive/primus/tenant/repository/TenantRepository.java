package com.thinkitive.primus.tenant.repository;

import com.thinkitive.primus.tenant.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {

    Optional<Tenant> findByUuid(UUID uuid);

    Optional<Tenant> findBySubdomain(String subdomain);

    boolean existsBySubdomain(String subdomain);
}
