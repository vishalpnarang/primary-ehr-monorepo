# Multi-Tenancy Strategy — Primus EHR

---

## Strategy: Shared Database + Row-Level Security (from day one)

**Decision:** Single PostgreSQL cluster, shared schema, every tenant-scoped table has `tenant_id` + PostgreSQL Row-Level Security (RLS) policies enforced at DB layer.

**Why not separate schemas or separate databases per tenant:**
- Separate databases: unmanageable migration complexity at 50+ tenants
- Separate schemas: Hibernate multi-tenancy support is complex and slow; schema-per-tenant makes analytics/reporting painful
- Shared DB + RLS: industry standard (Heroku, Notion, Linear all use this pattern); simpler migrations; single ORM configuration; RLS provides hard isolation at DB layer even if application bugs exist

---

## Tenant Lifecycle

```
1. Super Admin provisions tenant
   → Keycloak realm created
   → DB: tenants table row inserted
   → DB: RLS policy activates automatically (tenant_id exists)
   → Default data seeded (appointment types, roles, settings)
   → Welcome email to Tenant Admin

2. Tenant Admin onboards
   → Creates locations
   → Invites providers/staff
   → Configures integrations

3. Tenant active
   → All data isolated by tenant_id + RLS
   → Backups: same Aurora cluster, pitr per tenant available

4. Tenant deactivated
   → Soft delete (is_active = false)
   → Data retained per HIPAA 7-year requirement
   → Keycloak realm deactivated (users can't log in)
   → Can be reactivated

5. Tenant hard delete (legal request only)
   → Requires Super Admin + confirmation token
   → Data purged from DB (audit log retained)
   → Keycloak realm deleted
   → S3 data deleted
```

---

## Database Schema for Multi-Tenancy

### Global (not tenant-scoped) tables

```sql
-- Tenants directory
CREATE TABLE tenants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          VARCHAR(100) UNIQUE NOT NULL,    -- e.g., 'clinic-abc-health'
  name          VARCHAR(255) NOT NULL,
  npi           VARCHAR(10),
  tax_id        VARCHAR(20),
  status        VARCHAR(20) DEFAULT 'active',    -- active, suspended, deleted
  features      JSONB DEFAULT '{}',              -- Feature flags per tenant
  settings      JSONB DEFAULT '{}',              -- Tenant configuration
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Global audit log (all tenants, immutable)
CREATE TABLE audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id),     -- NULL for platform events
  user_id       UUID,
  action        VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id   UUID,
  old_value     JSONB,
  new_value     JSONB,
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);
-- audit_log has NO RLS — Super Admin can see all
```

### Tenant-scoped table template

```sql
-- Every tenant-scoped table follows this pattern
CREATE TABLE patients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  mrn           VARCHAR(20) NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  -- ... other fields
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  created_by    UUID,
  is_active     BOOLEAN DEFAULT true,
  
  CONSTRAINT uq_patient_mrn UNIQUE (tenant_id, mrn)
);

-- Index on tenant_id for all queries
CREATE INDEX idx_patients_tenant_id ON patients (tenant_id);

-- RLS policy
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON patients
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Super admin bypass (set via separate connection setting)
CREATE POLICY super_admin_bypass ON patients
  USING (current_setting('app.super_admin', true)::boolean = true);
```

---

## Spring Boot Multi-Tenancy Implementation

```java
// Hibernate @Filter for tenant_id (secondary check after RLS)
@Entity
@Table(name = "patients")
@FilterDef(name = "tenantFilter", 
    parameters = @ParamDef(name = "tenantId", type = UUID.class))
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public class Patient {
    
    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;
    
    // Hibernate sets this automatically via @PrePersist
}

// TenantAwareRepository — base class for all tenant-scoped repositories
public abstract class TenantAwareRepository<T> {
    
    @PersistenceContext
    private EntityManager em;
    
    protected void enableTenantFilter() {
        String tenantId = TenantContextHolder.getTenantId();
        em.unwrap(Session.class)
          .enableFilter("tenantFilter")
          .setParameter("tenantId", UUID.fromString(tenantId));
    }
}

// All entities auto-populate tenant_id on persist
@MappedSuperclass
public abstract class TenantEntity {
    
    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;
    
    @PrePersist
    protected void prePersist() {
        if (this.tenantId == null) {
            this.tenantId = UUID.fromString(TenantContextHolder.getTenantId());
        }
    }
}
```

---

## Tenant Provisioning Flow

```
POST /api/platform/tenants (Super Admin only)
↓
1. Validate input (name, NPI, admin email)
2. Generate tenant slug (clinic-name → clinic-name, deduplicate if needed)
3. Create Keycloak realm via Keycloak Admin API:
   - Create realm with slug name
   - Create clients (provider-portal, patient-portal, backend)
   - Create default roles
   - Set session/token policies
   - Configure MFA settings
4. Insert tenant record in DB
5. Seed default data:
   - Default appointment types (New Patient 60min, Follow-up 30min, AWV 45min, Telehealth 20min)
   - Default roles and permissions
   - Default notification templates
   - Default note templates (basic SOAP)
6. Create Tenant Admin Keycloak user with temporary password
7. Send welcome email with first-login link (expires 48h)
8. Return tenant details to Super Admin

All steps are idempotent — if provisioning fails partway through,
it can be retried without duplicate state.
```

---

## Tenant Context in HTTP Requests

```
Request flow:
Browser → [Authorization: Bearer {jwt}] → ALB → Spring Boot

Spring Boot JWT filter:
1. Validates JWT signature (RS256, Keycloak public key)
2. Extracts tenant_id claim
3. Sets TenantContextHolder.setTenantId(tenantId)
4. Sets PostgreSQL session: SET LOCAL app.current_tenant = '{tenantId}'
5. RLS enforces isolation for all subsequent DB queries
6. On request completion: TenantContextHolder.clear()
```

---

## Data Partitioning for Performance

At scale (50+ tenants, millions of patients), partition hot tables by tenant:

```sql
-- Future: partition patients by tenant_id for large datasets
CREATE TABLE patients (
  id        UUID NOT NULL,
  tenant_id UUID NOT NULL,
  -- ...
) PARTITION BY HASH (tenant_id);

CREATE TABLE patients_p0 PARTITION OF patients
  FOR VALUES WITH (modulus 8, remainder 0);
-- ... p1 through p7
```

This is deferred until a tenant exceeds ~500K patients.

---

## SaaS Billing Consideration

When Primus itself bills clinics for using the platform (Phase 10+):

```sql
CREATE TABLE tenant_subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  plan          VARCHAR(50) NOT NULL,          -- starter, growth, enterprise
  status        VARCHAR(20) NOT NULL,           -- active, past_due, cancelled
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  billing_cycle VARCHAR(20),                   -- monthly, annual
  seats         INTEGER,
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```
