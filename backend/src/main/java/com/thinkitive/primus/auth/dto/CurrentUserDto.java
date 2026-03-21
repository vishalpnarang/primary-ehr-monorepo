package com.thinkitive.primus.auth.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CurrentUserDto {

    private String userUuid;
    private String username;
    private String displayName;
    private String email;
    private String activeRole;
    private List<String> roles;
    private Long tenantId;
    private String tenantName;
    private String tenantSubdomain;
}
