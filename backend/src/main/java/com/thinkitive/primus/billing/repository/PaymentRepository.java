package com.thinkitive.primus.billing.repository;

import com.thinkitive.primus.billing.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    List<Payment> findByClaimId(Long claimId);

    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);

    List<Payment> findByTenantIdAndStatus(Long tenantId, Payment.PaymentStatus status);
}
