package com.thinkitive.primus.billing.repository;

import com.thinkitive.primus.billing.entity.ScheduledPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduledPaymentRepository extends JpaRepository<ScheduledPayment, Long> {

    List<ScheduledPayment> findByPatientIdAndTenantIdAndArchiveFalse(Long patientId, Long tenantId);

    List<ScheduledPayment> findByInvoiceIdAndTenantIdAndArchiveFalse(Long invoiceId, Long tenantId);

    List<ScheduledPayment> findByTenantIdAndStatusAndScheduledDateLessThanEqualAndArchiveFalse(
            Long tenantId, ScheduledPayment.ScheduledPaymentStatus status, LocalDate date);

    Optional<ScheduledPayment> findByTenantIdAndUuid(Long tenantId, String uuid);
}
