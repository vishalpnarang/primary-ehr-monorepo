package com.thinkitive.primus.order.repository;

import com.thinkitive.primus.order.entity.AoeAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AoeAnswerRepository extends JpaRepository<AoeAnswer, Long> {

    List<AoeAnswer> findByLabOrderIdAndTenantIdAndArchiveFalse(Long labOrderId, Long tenantId);

    Optional<AoeAnswer> findByTenantIdAndUuid(Long tenantId, String uuid);

    Optional<AoeAnswer> findByLabOrderIdAndQuestionIdAndTenantId(
            Long labOrderId, Long questionId, Long tenantId);
}
