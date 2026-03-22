package com.thinkitive.primus.auth.service;

import com.thinkitive.primus.auth.dto.FeatureDto;
import com.thinkitive.primus.auth.dto.PermissionDto;
import com.thinkitive.primus.auth.dto.RoleDto;
import com.thinkitive.primus.auth.entity.Feature;
import com.thinkitive.primus.auth.entity.Permission;
import com.thinkitive.primus.auth.entity.Role;
import com.thinkitive.primus.auth.entity.RolePermission;
import com.thinkitive.primus.auth.repository.FeatureRepository;
import com.thinkitive.primus.auth.repository.PermissionRepository;
import com.thinkitive.primus.auth.repository.RolePermissionRepository;
import com.thinkitive.primus.auth.repository.RoleRepository;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RbacServiceImpl implements RbacService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final FeatureRepository featureRepository;

    // -------------------------------------------------------------------------
    // Roles
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<RoleDto> getRolesByTenant(Long tenantId) {
        return roleRepository.findByTenantIdAndArchiveFalse(tenantId)
                .stream()
                .map(this::toRoleDto)
                .toList();
    }

    // -------------------------------------------------------------------------
    // Permissions
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<PermissionDto> getPermissionsByRole(Long roleId) {
        roleRepository.findById(roleId)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND, "Role not found: " + roleId));

        return rolePermissionRepository.findByRoleId(roleId)
                .stream()
                .map(rp -> toPermissionDto(rp.getPermission()))
                .toList();
    }

    // -------------------------------------------------------------------------
    // Features
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<FeatureDto> getFeaturesByTenant(Long tenantId) {
        return featureRepository.findByTenantIdAndArchiveFalse(tenantId)
                .stream()
                .map(this::toFeatureDto)
                .toList();
    }

    // -------------------------------------------------------------------------
    // Mutations
    // -------------------------------------------------------------------------

    @Override
    @Transactional
    public RoleDto assignPermissionToRole(Long roleId, Long permissionId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND, "Role not found: " + roleId));

        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND, "Permission not found: " + permissionId));

        if (rolePermissionRepository.existsByRoleIdAndPermissionId(roleId, permissionId)) {
            throw new PrimusException(ResponseCode.CONFLICT,
                    "Permission '" + permission.getName() + "' is already assigned to role '" + role.getName() + "'");
        }

        RolePermission assignment = RolePermission.builder()
                .role(role)
                .permission(permission)
                .build();

        rolePermissionRepository.save(assignment);

        return toRoleDto(role);
    }

    @Override
    @Transactional
    public FeatureDto toggleFeature(Long featureId) {
        Feature feature = featureRepository.findById(featureId)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND, "Feature not found: " + featureId));

        feature.setEnabled(!feature.isEnabled());
        Feature saved = featureRepository.save(feature);

        return toFeatureDto(saved);
    }

    // -------------------------------------------------------------------------
    // Mappers
    // -------------------------------------------------------------------------

    private RoleDto toRoleDto(Role role) {
        return RoleDto.builder()
                .id(role.getId())
                .uuid(role.getUuid())
                .tenantId(role.getTenantId())
                .name(role.getName())
                .description(role.getDescription())
                .system(role.isSystem())
                .status(role.getStatus())
                .createdAt(role.getCreatedAt())
                .modifiedAt(role.getModifiedAt())
                .build();
    }

    private PermissionDto toPermissionDto(Permission permission) {
        return PermissionDto.builder()
                .id(permission.getId())
                .uuid(permission.getUuid())
                .name(permission.getName())
                .description(permission.getDescription())
                .module(permission.getModule())
                .action(permission.getAction())
                .createdAt(permission.getCreatedAt())
                .build();
    }

    private FeatureDto toFeatureDto(Feature feature) {
        return FeatureDto.builder()
                .id(feature.getId())
                .uuid(feature.getUuid())
                .tenantId(feature.getTenantId())
                .name(feature.getName())
                .enabled(feature.isEnabled())
                .module(feature.getModule())
                .modifiedAt(feature.getModifiedAt())
                .build();
    }
}
