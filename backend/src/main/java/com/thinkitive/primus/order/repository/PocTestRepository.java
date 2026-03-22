package com.thinkitive.primus.order.repository;

import com.thinkitive.primus.order.entity.PocTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PocTestRepository extends JpaRepository<PocTest, Long> {

    List<PocTest> findByTenantIdAndArchiveFalse(Long tenantId);

    List<PocTest> findByTenantIdAndCategoryAndArchiveFalse(Long tenantId, String category);

    Optional<PocTest> findByTenantIdAndUuid(Long tenantId, String uuid);
}
