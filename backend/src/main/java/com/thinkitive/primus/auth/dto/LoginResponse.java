package com.thinkitive.primus.auth.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class LoginResponse {

    private UUID userUuid;
    private String username;
    private String displayName;
    private String email;
    private String role;
    private Long tenantId;
    private String tenantName;
    private String tenantSubdomain;
    private String accessToken;
    private String tokenType;
    private long expiresIn;
}
