package com.thinkitive.primus.auth.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class CurrentUserDto {

    private UUID userUuid;
    private String username;
    private String displayName;
    private String email;
    private String activeRole;
    private List<String> roles;
    private Long tenantId;
    private String tenantName;
    private String tenantSubdomain;
}
