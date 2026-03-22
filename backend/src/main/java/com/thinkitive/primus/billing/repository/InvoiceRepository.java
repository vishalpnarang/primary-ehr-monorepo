package com.thinkitive.primus.billing.repository;

import com.thinkitive.primus.billing.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findByPatientIdAndTenantIdAndArchiveFalseOrderByCreatedAtDesc(
            Long patientId, Long tenantId);

    List<Invoice> findByTenantIdAndStatusAndArchiveFalse(Long tenantId, Invoice.InvoiceStatus status);

    List<Invoice> findByEncounterIdAndTenantIdAndArchiveFalse(Long encounterId, Long tenantId);

    Optional<Invoice> findByTenantIdAndUuid(Long tenantId, String uuid);

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
}
