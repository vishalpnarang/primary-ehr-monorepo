package com.thinkitive.primus.auth.service;

import com.thinkitive.primus.auth.dto.FeatureDto;
import com.thinkitive.primus.auth.dto.PermissionDto;
import com.thinkitive.primus.auth.dto.RoleDto;

import java.util.List;

public interface RbacService {

    /** Returns all non-archived roles for the given tenant. */
    List<RoleDto> getRolesByTenant(Long tenantId);

    /** Returns all permissions currently assigned to the given role. */
    List<PermissionDto> getPermissionsByRole(Long roleId);

    /** Returns all non-archived features for the given tenant. */
    List<FeatureDto> getFeaturesByTenant(Long tenantId);

    /**
     * Assigns a permission to a role.
     * Throws {@link com.thinkitive.primus.shared.exception.PrimusException} with CONFLICT
     * if the assignment already exists, or NOT_FOUND if either entity is missing.
     */
    RoleDto assignPermissionToRole(Long roleId, Long permissionId);

    /**
     * Toggles the enabled flag on a feature.
     * Returns the updated feature DTO.
     * Throws NOT_FOUND if the feature does not exist.
     */
    FeatureDto toggleFeature(Long featureId);
}
