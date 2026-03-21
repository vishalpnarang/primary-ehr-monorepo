package com.thinkitive.primus.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SwitchRoleRequest {

    @NotBlank
    private String role;
}
