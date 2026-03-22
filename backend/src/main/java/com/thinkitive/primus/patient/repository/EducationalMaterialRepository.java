package com.thinkitive.primus.patient.repository;

import com.thinkitive.primus.patient.entity.EducationalMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EducationalMaterialRepository extends JpaRepository<EducationalMaterial, Long> {

    List<EducationalMaterial> findByTenantId(Long tenantId);

    List<EducationalMaterial> findByTenantIdAndArchiveFalse(Long tenantId);

    List<EducationalMaterial> findByCategoryAndTenantId(String category, Long tenantId);

    List<EducationalMaterial> findByContentTypeAndTenantId(
        EducationalMaterial.ContentType contentType,
        Long tenantId
    );
}
