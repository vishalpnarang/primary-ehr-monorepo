package com.thinkitive.primus.scheduling.repository;

import com.thinkitive.primus.scheduling.entity.BlockDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BlockDayRepository extends JpaRepository<BlockDay, Long> {

    List<BlockDay> findByProviderIdAndBlockDateBetweenAndTenantId(
        String providerId,
        LocalDate startDate,
        LocalDate endDate,
        Long tenantId
    );

    List<BlockDay> findByProviderIdAndBlockDateAndTenantId(
        String providerId,
        LocalDate blockDate,
        Long tenantId
    );

    List<BlockDay> findByProviderIdAndTenantId(String providerId, Long tenantId);

    boolean existsByProviderIdAndBlockDateAndTenantId(String providerId, LocalDate blockDate, Long tenantId);
}
