package com.thinkitive.primus.order.repository;

import com.thinkitive.primus.order.entity.ImagingResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImagingResultRepository extends JpaRepository<ImagingResult, Long> {

    List<ImagingResult> findByPatientIdAndTenantIdAndArchiveFalseOrderByResultDateDesc(
            Long patientId, Long tenantId);

    List<ImagingResult> findByOrderIdAndTenantIdAndArchiveFalse(Long orderId, Long tenantId);

    List<ImagingResult> findByTenantIdAndModalityAndArchiveFalse(Long tenantId, String modality);

    Optional<ImagingResult> findByTenantIdAndUuid(Long tenantId, String uuid);
}
