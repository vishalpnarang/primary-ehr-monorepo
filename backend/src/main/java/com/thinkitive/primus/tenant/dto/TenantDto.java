package com.thinkitive.primus.tenant.dto;

import com.thinkitive.primus.tenant.entity.Tenant.TenantStatus;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantDto {

    private Long id;
    private String uuid;
    private String name;
    private String subdomain;
    private String npi;
    private String taxId;
    private String phone;
    private String fax;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String zip;
    private TenantStatus status;
    private String createdBy;
    private Instant createdAt;
    private Instant modifiedAt;
}
