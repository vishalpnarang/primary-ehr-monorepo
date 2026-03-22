package com.thinkitive.primus.shared.config;

import org.hibernate.cfg.AvailableSettings;
import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Resolves the current tenant schema name for Hibernate's SCHEMA-based
 * multi-tenancy.
 *
 * <p>Returns {@code "tenant_{id}"} when a tenant context is active, or
 * {@code "public"} for unauthenticated / system-level operations.
 */
@Component
public class PrimusTenantIdentifierResolver
        implements CurrentTenantIdentifierResolver<String>, HibernatePropertiesCustomizer {

    static final String PUBLIC_SCHEMA = "public";
    static final String TENANT_SCHEMA_PREFIX = "tenant_";

    @Override
    public String resolveCurrentTenantIdentifier() {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            return PUBLIC_SCHEMA;
        }
        return TENANT_SCHEMA_PREFIX + tenantId;
    }

    @Override
    public boolean validateExistingCurrentSessions() {
        return true;
    }

    @Override
    public void customize(Map<String, Object> hibernateProperties) {
        hibernateProperties.put(AvailableSettings.MULTI_TENANT_IDENTIFIER_RESOLVER, this);
    }

    public static String schemaNameForTenant(Long tenantId) {
        return TENANT_SCHEMA_PREFIX + tenantId;
    }
}
