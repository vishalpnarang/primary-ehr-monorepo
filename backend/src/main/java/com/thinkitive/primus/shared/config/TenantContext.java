package com.thinkitive.primus.shared.config;

public final class TenantContext {

    private static final ThreadLocal<Long> TENANT_ID_HOLDER = new ThreadLocal<>();
    private static final ThreadLocal<String> SCHEMA_HOLDER = new ThreadLocal<>();

    private TenantContext() {
        // Utility class — no instances
    }

    public static void setTenantId(Long tenantId) {
        TENANT_ID_HOLDER.set(tenantId);
        if (tenantId != null) {
            SCHEMA_HOLDER.set(PrimusTenantIdentifierResolver.schemaNameForTenant(tenantId));
        }
    }

    public static Long getTenantId() {
        return TENANT_ID_HOLDER.get();
    }

    public static String getSchemaName() {
        String schema = SCHEMA_HOLDER.get();
        return schema != null ? schema : PrimusTenantIdentifierResolver.PUBLIC_SCHEMA;
    }

    public static void clear() {
        TENANT_ID_HOLDER.remove();
        SCHEMA_HOLDER.remove();
    }
}
