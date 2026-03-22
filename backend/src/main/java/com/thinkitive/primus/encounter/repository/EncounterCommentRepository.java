package com.thinkitive.primus.encounter.repository;

import com.thinkitive.primus.encounter.entity.EncounterComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EncounterCommentRepository extends JpaRepository<EncounterComment, Long> {

    List<EncounterComment> findByTenantId(Long tenantId);

    List<EncounterComment> findByTenantIdAndArchiveFalse(Long tenantId);

    List<EncounterComment> findByEncounterIdAndArchiveFalseOrderByCreatedAtAsc(Long encounterId);

    List<EncounterComment> findByEncounterIdAndTenantIdAndArchiveFalse(Long encounterId, Long tenantId);

    Optional<EncounterComment> findByTenantIdAndUuid(Long tenantId, String uuid);
}
