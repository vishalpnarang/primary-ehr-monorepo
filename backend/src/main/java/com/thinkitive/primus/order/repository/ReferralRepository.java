package com.thinkitive.primus.order.repository;

import com.thinkitive.primus.order.entity.Referral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReferralRepository extends JpaRepository<Referral, Long> {

    List<Referral> findByPatientIdAndArchiveFalse(Long patientId);

    List<Referral> findByTenantIdAndReferringProviderIdAndStatus(
        Long tenantId, Long referringProviderId, Referral.ReferralStatus status
    );

    List<Referral> findByTenantIdAndStatus(Long tenantId, Referral.ReferralStatus status);
}
