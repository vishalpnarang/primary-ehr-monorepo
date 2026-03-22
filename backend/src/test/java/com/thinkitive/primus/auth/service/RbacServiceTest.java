package com.thinkitive.primus.auth.service;

import com.thinkitive.primus.auth.dto.FeatureDto;
import com.thinkitive.primus.auth.dto.RoleDto;
import com.thinkitive.primus.auth.entity.Feature;
import com.thinkitive.primus.auth.entity.Permission;
import com.thinkitive.primus.auth.entity.Role;
import com.thinkitive.primus.auth.entity.RolePermission;
import com.thinkitive.primus.auth.repository.FeatureRepository;
import com.thinkitive.primus.auth.repository.PermissionRepository;
import com.thinkitive.primus.auth.repository.RolePermissionRepository;
import com.thinkitive.primus.auth.repository.RoleRepository;
import com.thinkitive.primus.shared.exception.PrimusException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RbacServiceTest {

    @Mock RoleRepository roleRepository;
    @Mock PermissionRepository permissionRepository;
    @Mock RolePermissionRepository rolePermissionRepository;
    @Mock FeatureRepository featureRepository;

    @InjectMocks
    RbacServiceImpl rbacService;

    private Role testRole;
    private Permission testPermission;
    private Feature testFeature;

    @BeforeEach
    void setUp() {
        testRole = Role.builder()
                .tenantId(1L)
                .name("PROVIDER")
                .description("Clinical provider role")
                .system(false)
                .status("ACTIVE")
                .build();
        testRole.setId(1L);
        testRole.setUuid(UUID.randomUUID().toString());

        testPermission = Permission.builder()
                .name("patient:read")
                .description("Read patient records")
                .module("PATIENT")
                .action("READ")
                .build();
        testPermission.setId(10L);
        testPermission.setUuid(UUID.randomUUID().toString());

        testFeature = Feature.builder()
                .tenantId(1L)
                .name("TELEHEALTH")
                .enabled(false)
                .module("SCHEDULING")
                .build();
        testFeature.setId(5L);
        testFeature.setUuid(UUID.randomUUID().toString());
    }

    @Test
    @DisplayName("getRolesByTenant returns mapped RoleDtos for all active roles")
    void getRolesByTenant_returnsRoleDtos() {
        when(roleRepository.findByTenantIdAndArchiveFalse(1L)).thenReturn(List.of(testRole));

        List<RoleDto> result = rbacService.getRolesByTenant(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("PROVIDER");
        assertThat(result.get(0).getTenantId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("assignPermissionToRole saves assignment and returns role DTO")
    void assignPermissionToRole_success() {
        when(roleRepository.findById(1L)).thenReturn(Optional.of(testRole));
        when(permissionRepository.findById(10L)).thenReturn(Optional.of(testPermission));
        when(rolePermissionRepository.existsByRoleIdAndPermissionId(1L, 10L)).thenReturn(false);
        when(rolePermissionRepository.save(any(RolePermission.class))).thenAnswer(inv -> inv.getArgument(0));

        RoleDto result = rbacService.assignPermissionToRole(1L, 10L);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("PROVIDER");
        verify(rolePermissionRepository).save(any(RolePermission.class));
    }

    @Test
    @DisplayName("assignPermissionToRole throws CONFLICT when permission already assigned")
    void assignPermissionToRole_duplicateConflict() {
        when(roleRepository.findById(1L)).thenReturn(Optional.of(testRole));
        when(permissionRepository.findById(10L)).thenReturn(Optional.of(testPermission));
        when(rolePermissionRepository.existsByRoleIdAndPermissionId(1L, 10L)).thenReturn(true);

        assertThatThrownBy(() -> rbacService.assignPermissionToRole(1L, 10L))
                .isInstanceOf(PrimusException.class)
                .hasMessageContaining("already assigned");

        verify(rolePermissionRepository, never()).save(any());
    }

    @Test
    @DisplayName("toggleFeature flips enabled flag from false to true")
    void toggleFeature_enablesDisabledFeature() {
        testFeature.setEnabled(false);
        Feature savedFeature = Feature.builder()
                .tenantId(1L).name("TELEHEALTH").enabled(true).module("SCHEDULING").build();
        savedFeature.setId(5L);
        savedFeature.setUuid(testFeature.getUuid());

        when(featureRepository.findById(5L)).thenReturn(Optional.of(testFeature));
        when(featureRepository.save(any(Feature.class))).thenReturn(savedFeature);

        FeatureDto result = rbacService.toggleFeature(5L);

        assertThat(result.isEnabled()).isTrue();
        verify(featureRepository).save(any(Feature.class));
    }

    @Test
    @DisplayName("toggleFeature throws NOT_FOUND when feature does not exist")
    void toggleFeature_notFound_throws() {
        when(featureRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> rbacService.toggleFeature(999L))
                .isInstanceOf(PrimusException.class)
                .hasMessageContaining("Feature not found");
    }

    @Test
    @DisplayName("getFeaturesByTenant returns only non-archived features for tenant")
    void getFeaturesByTenant_returnsNonArchivedFeatures() {
        Feature archivedFeature = Feature.builder()
                .tenantId(1L)
                .name("LEGACY_MODULE")
                .enabled(false)
                .module("BILLING")
                .build();
        archivedFeature.setId(6L);
        archivedFeature.setUuid(UUID.randomUUID().toString());
        archivedFeature.setArchive(true);

        // Repository method findByTenantIdAndArchiveFalse should only return non-archived
        when(featureRepository.findByTenantIdAndArchiveFalse(1L))
                .thenReturn(List.of(testFeature));

        List<FeatureDto> result = rbacService.getFeaturesByTenant(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("TELEHEALTH");
        verify(featureRepository).findByTenantIdAndArchiveFalse(1L);
    }

    @Test
    @DisplayName("assignPermissionToRole throws NOT_FOUND when role does not exist")
    void assignPermissionToRole_roleNotFound_throws() {
        when(roleRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> rbacService.assignPermissionToRole(999L, 10L))
                .isInstanceOf(PrimusException.class)
                .hasMessageContaining("Role not found");

        verify(rolePermissionRepository, never()).save(any());
    }

    @Test
    @DisplayName("assignPermissionToRole throws NOT_FOUND when permission does not exist")
    void assignPermissionToRole_permissionNotFound_throws() {
        when(roleRepository.findById(1L)).thenReturn(Optional.of(testRole));
        when(permissionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> rbacService.assignPermissionToRole(1L, 999L))
                .isInstanceOf(PrimusException.class)
                .hasMessageContaining("Permission not found");

        verify(rolePermissionRepository, never()).save(any());
    }
}
