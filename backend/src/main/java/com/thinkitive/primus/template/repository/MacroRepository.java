package com.thinkitive.primus.template.repository;

import com.thinkitive.primus.template.entity.Macro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MacroRepository extends JpaRepository<Macro, Long> {

    List<Macro> findByTenantId(Long tenantId);

    List<Macro> findByTenantIdAndArchiveFalse(Long tenantId);

    List<Macro> findByTenantIdAndCategoryAndArchiveFalse(Long tenantId, Macro.MacroCategory category);

    /** Shared macros are available to all providers in a tenant. */
    List<Macro> findByTenantIdAndIsSharedTrueAndArchiveFalse(Long tenantId);

    Optional<Macro> findByTenantIdAndAbbreviationAndArchiveFalse(Long tenantId, String abbreviation);

    Optional<Macro> findByTenantIdAndUuid(Long tenantId, String uuid);
}
