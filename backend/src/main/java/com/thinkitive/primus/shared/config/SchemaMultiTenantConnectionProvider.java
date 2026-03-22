package com.thinkitive.primus.shared.config;

import org.hibernate.cfg.AvailableSettings;
import org.hibernate.engine.jdbc.connections.spi.MultiTenantConnectionProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Map;

/**
 * Provides tenant-specific database connections by setting the PostgreSQL
 * {@code search_path} to the tenant's schema.
 *
 * <p>When Hibernate requests a connection for tenant {@code "tenant_5"},
 * this provider executes {@code SET search_path TO tenant_5, public} so
 * that all subsequent queries on that connection resolve to the tenant's
 * schema first, then fall back to {@code public} for shared tables
 * (tenants, users).
 */
@Component
public class SchemaMultiTenantConnectionProvider
        implements MultiTenantConnectionProvider<String>, HibernatePropertiesCustomizer {

    private static final Logger log = LoggerFactory.getLogger(SchemaMultiTenantConnectionProvider.class);
    private static final String SET_SCHEMA_SQL = "SET search_path TO %s, public";

    private final DataSource dataSource;

    public SchemaMultiTenantConnectionProvider(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public Connection getAnyConnection() throws SQLException {
        return dataSource.getConnection();
    }

    @Override
    public void releaseAnyConnection(Connection connection) throws SQLException {
        connection.close();
    }

    @Override
    public Connection getConnection(String tenantIdentifier) throws SQLException {
        Connection connection = getAnyConnection();
        try {
            if (tenantIdentifier != null && !PrimusTenantIdentifierResolver.PUBLIC_SCHEMA.equals(tenantIdentifier)) {
                connection.createStatement().execute(
                        String.format(SET_SCHEMA_SQL, sanitizeSchemaName(tenantIdentifier)));
                log.debug("Set search_path to: {}, public", tenantIdentifier);
            }
        } catch (SQLException e) {
            connection.close();
            throw e;
        }
        return connection;
    }

    @Override
    public void releaseConnection(String tenantIdentifier, Connection connection) throws SQLException {
        try {
            connection.createStatement().execute("SET search_path TO public");
        } catch (SQLException e) {
            log.warn("Failed to reset search_path on connection release: {}", e.getMessage());
        }
        connection.close();
    }

    @Override
    public boolean supportsAggressiveRelease() {
        return false;
    }

    @Override
    public boolean isUnwrappableAs(Class<?> unwrapType) {
        return false;
    }

    @Override
    public <T> T unwrap(Class<T> unwrapType) {
        throw new UnsupportedOperationException("Cannot unwrap " + unwrapType);
    }

    @Override
    public void customize(Map<String, Object> hibernateProperties) {
        hibernateProperties.put(AvailableSettings.MULTI_TENANT_CONNECTION_PROVIDER, this);
    }

    /**
     * Prevents SQL injection via tenant schema names.
     * Only allows alphanumeric + underscore characters.
     */
    private static String sanitizeSchemaName(String schema) {
        if (schema == null || !schema.matches("^[a-zA-Z0-9_]+$")) {
            throw new IllegalArgumentException("Invalid schema name: " + schema);
        }
        return schema;
    }
}
