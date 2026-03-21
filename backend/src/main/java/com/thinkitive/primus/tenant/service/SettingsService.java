package com.thinkitive.primus.tenant.service;

import com.thinkitive.primus.tenant.dto.*;

import java.util.List;

public interface SettingsService {

    TenantDto getOrganization();

    TenantDto updateOrganization(UpdateTenantRequest request);

    List<LocationDto> listLocations();

    LocationDto addLocation(CreateLocationRequest request);

    List<UserDto> listUsers();

    UserDto inviteUser(InviteUserRequest request);
}
