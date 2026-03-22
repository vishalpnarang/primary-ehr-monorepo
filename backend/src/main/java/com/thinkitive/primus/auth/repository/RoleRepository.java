package com.thinkitive.primus.auth.repository;

import com.thinkitive.primus.auth.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    List<Role> findByTenantId(Long tenantId);

    List<Role> findByTenantIdAndArchiveFalse(Long tenantId);

    Optional<Role> findByTenantIdAndName(Long tenantId, String name);

    boolean existsByTenantIdAndName(Long tenantId, String name);
}
