package com.thinkitive.primus.tenant.service;

import com.thinkitive.primus.shared.config.TenantContext;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import com.thinkitive.primus.tenant.dto.*;
import com.thinkitive.primus.tenant.entity.Location;
import com.thinkitive.primus.tenant.entity.Tenant;
import com.thinkitive.primus.tenant.repository.LocationRepository;
import com.thinkitive.primus.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Phase-1/2 implementation. Reads tenant and location data from JPA.
 * Phase 1: listUsers / inviteUser will call the Keycloak Admin REST API.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SettingsServiceImpl implements SettingsService {

    private final TenantRepository   tenantRepository;
    private final LocationRepository locationRepository;

    // ── Organization (Tenant) ─────────────────────────────────────────────────

    @Override
    public TenantDto getOrganization() {
        Long tenantId = TenantContext.getTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Tenant not found: " + tenantId));
        return toTenantDto(tenant);
    }

    @Override
    @Transactional
    public TenantDto updateOrganization(UpdateTenantRequest request) {
        Long tenantId = TenantContext.getTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new PrimusException(ResponseCode.NOT_FOUND,
                        "Tenant not found: " + tenantId));

        if (request.getName()         != null) tenant.setName(request.getName());
        if (request.getNpi()          != null) tenant.setNpi(request.getNpi());
        if (request.getTaxId()        != null) tenant.setTaxId(request.getTaxId());
        if (request.getPhone()        != null) tenant.setPhone(request.getPhone());
        if (request.getFax()          != null) tenant.setFax(request.getFax());
        if (request.getAddressLine1() != null) tenant.setAddressLine1(request.getAddressLine1());
        if (request.getAddressLine2() != null) tenant.setAddressLine2(request.getAddressLine2());
        if (request.getCity()         != null) tenant.setCity(request.getCity());
        if (request.getState()        != null) tenant.setState(request.getState());
        if (request.getZip()          != null) tenant.setZip(request.getZip());

        tenantRepository.save(tenant);
        log.info("Organization updated for tenant={}", tenantId);
        return toTenantDto(tenant);
    }

    // ── Locations ─────────────────────────────────────────────────────────────

    @Override
    public List<LocationDto> listLocations() {
        Long tenantId = TenantContext.getTenantId();
        return locationRepository.findByTenantIdAndActiveTrue(tenantId)
                .stream()
                .map(this::toLocationDto)
                .toList();
    }

    @Override
    @Transactional
    public LocationDto addLocation(CreateLocationRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Adding location name={} tenant={}", request.getName(), tenantId);

        Location location = Location.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .addressLine1(request.getAddressLine1())
                .city(request.getCity())
                .state(request.getState())
                .zip(request.getZip())
                .phone(request.getPhone())
                .fax(request.getFax())
                .active(true)
                .build();
        locationRepository.save(location);

        return toLocationDto(location);
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    /**
     * Phase 1: call Keycloak Admin REST API GET /admin/realms/{realm}/users?briefRepresentation=false
     * and filter by the tenant's group/attribute.
     * Returns empty list until Keycloak integration is implemented.
     */
    @Override
    public List<UserDto> listUsers() {
        Long tenantId = TenantContext.getTenantId();
        log.info("listUsers called for tenant={} — Keycloak Admin API not yet integrated (Phase 1)", tenantId);
        // TODO Phase 1: GET /admin/realms/primus/users?q=tenant_id:{tenantId}
        return List.of();
    }

    /**
     * Phase 1: POST to Keycloak Admin API to create user + send verification email.
     * Creates a minimal UserDto with enabled=false (pending email verification).
     */
    @Override
    @Transactional
    public UserDto inviteUser(InviteUserRequest request) {
        Long tenantId = TenantContext.getTenantId();
        log.info("Inviting user email={} roles={} tenant={}", request.getEmail(), request.getRoles(), tenantId);

        // TODO Phase 1: call Keycloak Admin REST API to create user and add to tenant group.
        // POST /admin/realms/primus/users
        // {
        //   "username": "<email-local-part>",
        //   "email": "<email>",
        //   "firstName": "<firstName>",
        //   "lastName": "<lastName>",
        //   "enabled": true,
        //   "requiredActions": ["VERIFY_EMAIL"],
        //   "attributes": { "tenant_id": ["<tenantId>"] }
        // }

        return UserDto.builder()
                .uuid(java.util.UUID.randomUUID().toString())
                .username(request.getEmail().split("@")[0])
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .roles(request.getRoles() != null ? request.getRoles() : List.of())
                .enabled(false)   // pending email verification
                .createdAt(Instant.now())
                .build();
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private TenantDto toTenantDto(Tenant t) {
        return TenantDto.builder()
                .id(t.getId())
                .uuid(t.getUuid())
                .name(t.getName())
                .subdomain(t.getSubdomain())
                .npi(t.getNpi())
                .taxId(t.getTaxId())
                .phone(t.getPhone())
                .fax(t.getFax())
                .addressLine1(t.getAddressLine1())
                .addressLine2(t.getAddressLine2())
                .city(t.getCity())
                .state(t.getState())
                .zip(t.getZip())
                .status(t.getStatus())
                .createdBy(t.getCreatedBy())
                .createdAt(t.getCreatedAt())
                .modifiedAt(t.getModifiedAt())
                .build();
    }

    private LocationDto toLocationDto(Location l) {
        return LocationDto.builder()
                .uuid(l.getUuid())
                .name(l.getName())
                .addressLine1(l.getAddressLine1())
                .city(l.getCity())
                .state(l.getState())
                .zip(l.getZip())
                .phone(l.getPhone())
                .fax(l.getFax())
                .active(l.isActive())
                .build();
    }
}
