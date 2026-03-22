package com.thinkitive.primus.billing.repository;

import com.thinkitive.primus.billing.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    List<PaymentTransaction> findByPatientIdAndTenantIdAndArchiveFalseOrderByCreatedAtDesc(
            Long patientId, Long tenantId);

    List<PaymentTransaction> findByInvoiceIdAndTenantIdAndArchiveFalse(Long invoiceId, Long tenantId);

    Optional<PaymentTransaction> findByTenantIdAndUuid(Long tenantId, String uuid);
}
