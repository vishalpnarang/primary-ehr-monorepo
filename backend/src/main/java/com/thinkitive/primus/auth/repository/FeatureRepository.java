package com.thinkitive.primus.auth.repository;

import com.thinkitive.primus.auth.entity.Feature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeatureRepository extends JpaRepository<Feature, Long> {

    List<Feature> findByTenantId(Long tenantId);

    List<Feature> findByTenantIdAndEnabled(Long tenantId, boolean enabled);

    List<Feature> findByTenantIdAndArchiveFalse(Long tenantId);

    Optional<Feature> findByTenantIdAndName(Long tenantId, String name);
}
