package com.thinkitive.primus.tenant.repository;

import com.thinkitive.primus.tenant.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {

    List<Location> findByTenantIdAndActiveTrue(Long tenantId);

    Optional<Location> findByTenantIdAndUuid(Long tenantId, UUID uuid);
}
