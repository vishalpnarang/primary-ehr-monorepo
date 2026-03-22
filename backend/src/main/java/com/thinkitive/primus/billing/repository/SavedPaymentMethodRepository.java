package com.thinkitive.primus.billing.repository;

import com.thinkitive.primus.billing.entity.SavedPaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedPaymentMethodRepository extends JpaRepository<SavedPaymentMethod, Long> {

    List<SavedPaymentMethod> findByPatientIdAndTenantIdAndArchiveFalse(Long patientId, Long tenantId);

    Optional<SavedPaymentMethod> findByPatientIdAndTenantIdAndIsDefaultTrue(Long patientId, Long tenantId);

    Optional<SavedPaymentMethod> findByTenantIdAndUuid(Long tenantId, String uuid);
}
