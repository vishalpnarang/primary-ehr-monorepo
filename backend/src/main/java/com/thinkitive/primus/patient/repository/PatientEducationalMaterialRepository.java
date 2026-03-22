package com.thinkitive.primus.patient.repository;

import com.thinkitive.primus.patient.entity.PatientEducationalMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientEducationalMaterialRepository extends JpaRepository<PatientEducationalMaterial, Long> {

    List<PatientEducationalMaterial> findByPatientIdAndTenantId(Long patientId, Long tenantId);

    List<PatientEducationalMaterial> findByPatientIdAndTenantIdAndArchiveFalse(Long patientId, Long tenantId);

    List<PatientEducationalMaterial> findByMaterialIdAndTenantId(Long materialId, Long tenantId);

    boolean existsByPatientIdAndMaterialId(Long patientId, Long materialId);
}
