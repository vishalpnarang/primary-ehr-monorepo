package com.thinkitive.primus.tenant.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class InviteUserRequest {

    @NotBlank @Email
    private String email;
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    private List<String> roles;
}
