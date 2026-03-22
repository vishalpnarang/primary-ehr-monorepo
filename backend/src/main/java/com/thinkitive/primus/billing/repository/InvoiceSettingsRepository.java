package com.thinkitive.primus.billing.repository;

import com.thinkitive.primus.billing.entity.InvoiceSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceSettingsRepository extends JpaRepository<InvoiceSettings, Long> {

    Optional<InvoiceSettings> findByTenantId(Long tenantId);

    Optional<InvoiceSettings> findByTenantIdAndUuid(Long tenantId, String uuid);
}
