package com.thinkitive.primus.scheduling.repository;

import com.thinkitive.primus.scheduling.entity.ProviderAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProviderAvailabilityRepository extends JpaRepository<ProviderAvailability, Long> {

    List<ProviderAvailability> findByProviderIdAndTenantId(String providerId, Long tenantId);

    List<ProviderAvailability> findByProviderIdAndDayOfWeekAndTenantId(
        String providerId,
        int dayOfWeek,
        Long tenantId
    );

    List<ProviderAvailability> findByProviderIdAndTenantIdAndIsActiveTrue(String providerId, Long tenantId);

    List<ProviderAvailability> findByTenantIdAndIsActiveTrue(Long tenantId);
}
