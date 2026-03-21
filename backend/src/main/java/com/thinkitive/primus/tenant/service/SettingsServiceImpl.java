package com.thinkitive.primus.tenant.service;

import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.tenant.dto.*;
import com.thinkitive.primus.tenant.entity.Tenant;
import com.thinkitive.primus.tenant.repository.LocationRepository;
import com.thinkitive.primus.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Phase-0/1 stub. Phase 1: pull users from Keycloak Admin API.
 * Phase 2+: full tenant management from DB.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SettingsServiceImpl implements SettingsService {

    private final TenantRepository tenantRepository;
    private final LocationRepository locationRepository;

    @Override
    public TenantDto getOrganization() {
        Long tenantId = TenantContext.getTenantId();
        // Phase 2: tenantRepository.findById(tenantId).map(this::toDto).orElseThrow(...)
        return TenantDto.builder()
                .id(tenantId)
                .uuid(UUID.fromString("ffffffff-0000-0000-0000-000000000001"))
                .name("Primary Plus Health")
                .subdomain("primaryplus")
                .npi("1234567890")
                .taxId("12-3456789")
                .phone("6145550100")
                .addressLine1("300 East Broad Street")
                .city("Columbus")
                .state("OH")
                .zip("43215")
                .status(Tenant.TenantStatus.ACTIVE)
                .build();
    }

    @Override
    @Transactional
    public TenantDto updateOrganization(UpdateTenantRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Updating organization tenant={}", tenantId);
        TenantDto dto = getOrganization();
        if (request.getName()    != null) dto.setName(request.getName());
        if (request.getNpi()     != null) dto.setNpi(request.getNpi());
        if (request.getPhone()   != null) dto.setPhone(request.getPhone());
        if (request.getCity()    != null) dto.setCity(request.getCity());
        if (request.getState()   != null) dto.setState(request.getState());
        dto.setModifiedAt(Instant.now());
        return dto;
    }

    @Override
    public List<LocationDto> listLocations() {
        return List.of(
                LocationDto.builder()
                        .uuid(UUID.randomUUID())
                        .name("Primary Plus — Main Campus")
                        .addressLine1("300 East Broad Street")
                        .city("Columbus")
                        .state("OH")
                        .zip("43215")
                        .phone("6145550100")
                        .active(true)
                        .build(),
                LocationDto.builder()
                        .uuid(UUID.randomUUID())
                        .name("Primary Plus — Westerville")
                        .addressLine1("8200 N High Street")
                        .city("Westerville")
                        .state("OH")
                        .zip("43081")
                        .phone("6145550200")
                        .active(true)
                        .build()
        );
    }

    @Override
    @Transactional
    public LocationDto addLocation(CreateLocationRequest request) {
        log.info("Adding location name={} tenant={}", request.getName(), TenantContext.getTenantId());
        return LocationDto.builder()
                .uuid(UUID.randomUUID())
                .name(request.getName())
                .addressLine1(request.getAddressLine1())
                .city(request.getCity())
                .state(request.getState())
                .zip(request.getZip())
                .phone(request.getPhone())
                .fax(request.getFax())
                .active(true)
                .build();
    }

    @Override
    public List<UserDto> listUsers() {
        // Phase 1: fetch from Keycloak Admin REST API GET /admin/realms/{realm}/users
        return List.of(
                UserDto.builder()
                        .uuid(UUID.fromString("11111111-0000-0000-0000-000000000001"))
                        .username("sarah.mitchell")
                        .email("sarah.mitchell@primaryplus.com")
                        .firstName("Sarah")
                        .lastName("Mitchell")
                        .roles(List.of("PROVIDER"))
                        .enabled(true)
                        .createdAt(Instant.now().minusSeconds(86400 * 90))
                        .build(),
                UserDto.builder()
                        .uuid(UUID.fromString("22222222-0000-0000-0000-000000000002"))
                        .username("jessica.chen")
                        .email("jessica.chen@primaryplus.com")
                        .firstName("Jessica")
                        .lastName("Chen")
                        .roles(List.of("NURSE"))
                        .enabled(true)
                        .createdAt(Instant.now().minusSeconds(86400 * 60))
                        .build()
        );
    }

    @Override
    @Transactional
    public UserDto inviteUser(InviteUserRequest request) {
        log.info("Inviting user email={} roles={}", request.getEmail(), request.getRoles());
        // Phase 1: call Keycloak Admin API to create user + send verification email
        return UserDto.builder()
                .uuid(UUID.randomUUID())
                .username(request.getEmail().split("@")[0])
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .roles(request.getRoles() != null ? request.getRoles() : List.of())
                .enabled(false) // pending email verification
                .createdAt(Instant.now())
                .build();
    }
}
