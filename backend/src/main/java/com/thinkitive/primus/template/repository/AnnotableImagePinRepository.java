package com.thinkitive.primus.template.repository;

import com.thinkitive.primus.template.entity.AnnotableImagePin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnnotableImagePinRepository extends JpaRepository<AnnotableImagePin, Long> {

    List<AnnotableImagePin> findByTenantIdAndArchiveFalse(Long tenantId);

    List<AnnotableImagePin> findByImageIdAndArchiveFalse(Long imageId);

    List<AnnotableImagePin> findByImageIdAndEncounterIdAndArchiveFalse(Long imageId, Long encounterId);

    List<AnnotableImagePin> findByImageIdAndPatientIdAndArchiveFalse(Long imageId, Long patientId);

    Optional<AnnotableImagePin> findByTenantIdAndUuid(Long tenantId, String uuid);
}
