package com.thinkitive.primus.template.repository;

import com.thinkitive.primus.template.entity.AnnotableImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnnotableImageRepository extends JpaRepository<AnnotableImage, Long> {

    List<AnnotableImage> findByTenantIdAndArchiveFalse(Long tenantId);

    /** System images are platform-shipped and visible to all tenants. */
    List<AnnotableImage> findByIsSystemTrueAndArchiveFalse();

    List<AnnotableImage> findByTenantIdAndCategoryAndArchiveFalse(Long tenantId, String category);

    Optional<AnnotableImage> findByTenantIdAndUuid(Long tenantId, String uuid);

    Optional<AnnotableImage> findByUuidAndArchiveFalse(String uuid);
}
