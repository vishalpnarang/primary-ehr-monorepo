package com.thinkitive.primus.tenant.service;

import com.thinkitive.primus.shared.config.PrimusTenantIdentifierResolver;
import com.thinkitive.primus.shared.dto.ResponseCode;
import com.thinkitive.primus.shared.exception.PrimusException;
import com.thinkitive.primus.tenant.dto.CreateTenantRequest;
import com.thinkitive.primus.tenant.dto.TenantDto;
import com.thinkitive.primus.tenant.entity.Tenant;
import com.thinkitive.primus.tenant.repository.TenantRepository;
import liquibase.Liquibase;
import liquibase.database.Database;
import liquibase.database.DatabaseFactory;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

/**
 * Provisions new tenants with full schema isolation.
 *
 * <p>When a new tenant is created:
 * <ol>
 *   <li>A record is inserted into the global {@code tenants} table (public schema)</li>
 *   <li>A new PostgreSQL schema {@code tenant_{id}} is created</li>
 *   <li>All tenant-scoped Liquibase migrations are run against the new schema</li>
 *   <li>Basic seed data is loaded (roles, permissions, default settings)</li>
 *   <li>The tenant status is set to {@code ACTIVE}</li>
 * </ol>
 *
 * <p>The subdomain is stored for CloudFront routing. The caller (super_admin)
 * must separately configure the CloudFront alternate domain.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TenantProvisioningService {

    private final TenantRepository tenantRepository;
    private final DataSource dataSource;

    private static final String TENANT_CHANGELOG = "db/tenant-master.yaml";

    @Transactional
    public TenantDto provisionTenant(CreateTenantRequest request) {
        if (tenantRepository.existsBySubdomain(request.getSubdomain())) {
            throw new PrimusException(ResponseCode.CONFLICT,
                    "Subdomain already taken: " + request.getSubdomain());
        }

        // 1. Create tenant record in public schema (status = PROVISIONING)
        Tenant tenant = Tenant.builder()
                .name(request.getName())
                .subdomain(request.getSubdomain())
                .npi(request.getNpi())
                .taxId(request.getTaxId())
                .phone(request.getPhone())
                .fax(request.getFax())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .zip(request.getZip())
                .status(Tenant.TenantStatus.PROVISIONING)
                .build();
        tenant = tenantRepository.save(tenant);

        String schemaName = PrimusTenantIdentifierResolver.schemaNameForTenant(tenant.getId());

        try {
            // 2. Create the PostgreSQL schema
            createSchema(schemaName);

            // 3. Run Liquibase migrations against the new schema
            runTenantMigrations(schemaName);

            // 4. Seed basic data (roles, permissions, default settings)
            seedTenantData(schemaName, tenant.getId(), tenant.getName());

            // 5. Mark tenant as ACTIVE
            tenant.setStatus(Tenant.TenantStatus.ACTIVE);
            tenantRepository.save(tenant);

            log.info("Tenant provisioned: id={}, schema={}, subdomain={}",
                    tenant.getId(), schemaName, tenant.getSubdomain());

        } catch (Exception e) {
            log.error("Failed to provision tenant schema '{}': {}", schemaName, e.getMessage(), e);
            tenant.setStatus(Tenant.TenantStatus.INACTIVE);
            tenantRepository.save(tenant);
            throw new PrimusException(ResponseCode.INTERNAL_ERROR,
                    "Tenant provisioning failed: " + e.getMessage());
        }

        return TenantDto.builder()
                .uuid(tenant.getUuid())
                .name(tenant.getName())
                .subdomain(tenant.getSubdomain())
                .status(tenant.getStatus())
                .build();
    }

    private void createSchema(String schemaName) {
        if (!schemaName.matches("^[a-zA-Z0-9_]+$")) {
            throw new IllegalArgumentException("Invalid schema name: " + schemaName);
        }
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("CREATE SCHEMA IF NOT EXISTS " + schemaName);
            log.info("Created schema: {}", schemaName);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create schema: " + schemaName, e);
        }
    }

    private void runTenantMigrations(String schemaName) {
        try (Connection conn = dataSource.getConnection()) {
            conn.createStatement().execute("SET search_path TO " + schemaName);
            Database database = DatabaseFactory.getInstance()
                    .findCorrectDatabaseImplementation(new JdbcConnection(conn));
            database.setDefaultSchemaName(schemaName);
            database.setLiquibaseSchemaName(schemaName);

            Liquibase liquibase = new Liquibase(
                    TENANT_CHANGELOG,
                    new ClassLoaderResourceAccessor(),
                    database);
            liquibase.update("");
            log.info("Liquibase migrations complete for schema: {}", schemaName);
        } catch (Exception e) {
            throw new RuntimeException("Failed to run migrations for schema: " + schemaName, e);
        }
    }

    private void seedTenantData(String schemaName, Long tenantId, String tenantName) {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("SET search_path TO " + schemaName + ", public");

            // Seed default roles
            stmt.execute("""
                INSERT INTO roles (uuid, tenant_id, name, display_name, description, is_system, created, modified, archive)
                VALUES
                  (gen_random_uuid(), %d, 'provider', 'Provider', 'Clinical care, charting, prescribing', true, now(), now(), false),
                  (gen_random_uuid(), %d, 'nurse', 'Nurse / MA', 'Rooming, vitals, clinical support', true, now(), now(), false),
                  (gen_random_uuid(), %d, 'front_desk', 'Front Desk', 'Scheduling, check-in, registration', true, now(), now(), false),
                  (gen_random_uuid(), %d, 'billing', 'Billing Staff', 'Claims, RCM, denials', true, now(), now(), false),
                  (gen_random_uuid(), %d, 'practice_admin', 'Practice Admin', 'Office manager — daily ops', true, now(), now(), false),
                  (gen_random_uuid(), %d, 'tenant_admin', 'Tenant Admin', 'Clinic owner/manager', true, now(), now(), false)
                ON CONFLICT DO NOTHING
                """.formatted(tenantId, tenantId, tenantId, tenantId, tenantId, tenantId));

            // Seed default features
            stmt.execute("""
                INSERT INTO features (uuid, tenant_id, name, display_name, enabled, description, created, modified, archive)
                VALUES
                  (gen_random_uuid(), %d, 'scheduling', 'Scheduling', true, 'Appointment scheduling', now(), now(), false),
                  (gen_random_uuid(), %d, 'encounters', 'Encounters', true, 'Clinical encounters and SOAP notes', now(), now(), false),
                  (gen_random_uuid(), %d, 'prescriptions', 'Prescriptions', true, 'Prescription management', now(), now(), false),
                  (gen_random_uuid(), %d, 'billing', 'Billing', true, 'Claims and billing', now(), now(), false),
                  (gen_random_uuid(), %d, 'messaging', 'Messaging', true, 'Secure messaging', now(), now(), false),
                  (gen_random_uuid(), %d, 'labs', 'Labs', true, 'Lab ordering and results', now(), now(), false),
                  (gen_random_uuid(), %d, 'telehealth', 'Telehealth', false, 'Video visits', now(), now(), false),
                  (gen_random_uuid(), %d, 'analytics', 'Analytics', true, 'Reporting and dashboards', now(), now(), false)
                ON CONFLICT DO NOTHING
                """.formatted(tenantId, tenantId, tenantId, tenantId,
                    tenantId, tenantId, tenantId, tenantId));

            log.info("Seed data loaded for tenant {} ({})", tenantId, tenantName);
        } catch (Exception e) {
            throw new RuntimeException("Failed to seed data for schema: " + schemaName, e);
        }
    }
}
