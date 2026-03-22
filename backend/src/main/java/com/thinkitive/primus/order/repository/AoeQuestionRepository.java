package com.thinkitive.primus.order.repository;

import com.thinkitive.primus.order.entity.AoeQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AoeQuestionRepository extends JpaRepository<AoeQuestion, Long> {

    List<AoeQuestion> findByLabCatalogIdAndTenantIdAndArchiveFalseOrderByDisplayOrderAsc(
            Long labCatalogId, Long tenantId);

    List<AoeQuestion> findByTenantIdAndArchiveFalse(Long tenantId);

    Optional<AoeQuestion> findByTenantIdAndUuid(Long tenantId, String uuid);
}
