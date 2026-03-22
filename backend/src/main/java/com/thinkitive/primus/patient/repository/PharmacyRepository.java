package com.thinkitive.primus.patient.repository;

import com.thinkitive.primus.patient.entity.Pharmacy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PharmacyRepository extends JpaRepository<Pharmacy, Long> {

    List<Pharmacy> findByTenantId(Long tenantId);

    List<Pharmacy> findByTenantIdAndArchiveFalse(Long tenantId);

    Optional<Pharmacy> findByNpiAndTenantId(String npi, Long tenantId);

    Optional<Pharmacy> findByNcpdpIdAndTenantId(String ncpdpId, Long tenantId);
}
