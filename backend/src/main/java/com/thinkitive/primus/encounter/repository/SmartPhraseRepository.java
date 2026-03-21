package com.thinkitive.primus.encounter.repository;

import com.thinkitive.primus.encounter.entity.SmartPhrase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SmartPhraseRepository extends JpaRepository<SmartPhrase, Long> {

    List<SmartPhrase> findByTenantIdAndArchiveFalse(Long tenantId);

    List<SmartPhrase> findByTenantIdAndCreatedByUserId(Long tenantId, Long createdByUserId);

    Optional<SmartPhrase> findByTenantIdAndTriggerAndCreatedByUserId(
        Long tenantId, String trigger, Long createdByUserId
    );

    List<SmartPhrase> findByTenantIdAndTriggerContainingIgnoreCase(Long tenantId, String triggerFragment);
}
