package com.thinkitive.primus.tenant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTenantRequest {

    @NotBlank(message = "Tenant name is required")
    @Size(max = 255)
    private String name;

    @NotBlank(message = "Subdomain is required")
    @Size(max = 100)
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Subdomain must be lowercase alphanumeric with hyphens only")
    private String subdomain;

    @Size(max = 20)
    private String npi;

    @Size(max = 20)
    private String taxId;

    @Size(max = 20)
    private String phone;

    @Size(max = 20)
    private String fax;

    @Size(max = 255)
    private String addressLine1;

    @Size(max = 255)
    private String addressLine2;

    @Size(max = 100)
    private String city;

    @Size(max = 2)
    private String state;

    @Size(max = 10)
    private String zip;
}
