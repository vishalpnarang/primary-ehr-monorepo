package com.thinkitive.primus.auth.repository;

import com.thinkitive.primus.auth.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    List<Permission> findByModule(String module);

    List<Permission> findByModuleAndArchiveFalse(String module);

    Optional<Permission> findByName(String name);

    boolean existsByName(String name);
}
