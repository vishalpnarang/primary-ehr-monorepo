package com.thinkitive.primus.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank
    private String username;

    @NotBlank
    private String password;

    /** Optional: tenant subdomain for multi-tenant routing */
    private String subdomain;
}
