package com.thinkitive.primus.billing.repository;

import com.thinkitive.primus.billing.entity.Credit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CreditRepository extends JpaRepository<Credit, Long> {

    List<Credit> findByPatientIdAndTenantIdAndArchiveFalse(Long patientId, Long tenantId);

    List<Credit> findByPatientIdAndTenantIdAndStatusAndArchiveFalse(
            Long patientId, Long tenantId, Credit.CreditStatus status);

    Optional<Credit> findByTenantIdAndUuid(Long tenantId, String uuid);
}
