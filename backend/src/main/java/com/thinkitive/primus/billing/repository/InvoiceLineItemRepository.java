package com.thinkitive.primus.billing.repository;

import com.thinkitive.primus.billing.entity.InvoiceLineItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceLineItemRepository extends JpaRepository<InvoiceLineItem, Long> {

    List<InvoiceLineItem> findByInvoiceIdAndTenantIdAndArchiveFalse(Long invoiceId, Long tenantId);

    Optional<InvoiceLineItem> findByTenantIdAndUuid(Long tenantId, String uuid);
}
