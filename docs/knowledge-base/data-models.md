# Data Models — Primus EHR

## Status
- **Full data model doc:** Pending (`docs/architecture/data-model.md` not yet written)
- **Source:** Extracted from multi-tenancy, auth, and integration docs

## Database Strategy
- PostgreSQL 16 (Aurora Serverless v2 in prod)
- Shared DB + `tenant_id` column + RLS on all tenant-scoped tables
- HikariCP connection pool
- Liquibase migrations (SQL changesets)

## Global Tables (no RLS)

| Table | Purpose | FHIR Resource |
|-------|---------|---------------|
| `tenants` | Tenant directory (slug, NPI, features, settings) | Organization |
| `audit_log` | Immutable audit trail (7-year retention) | AuditEvent |
| `tenant_subscriptions` | SaaS billing (Phase 10) | — |

## Tenant-Scoped Tables (RLS enforced)

| Table | Purpose | FHIR Resource | Phase |
|-------|---------|---------------|-------|
| `patients` | Demographics, MRN, insurance | Patient | 2 |
| `appointments` | Scheduling, status tracking | Appointment | 2 |
| `encounters` | Visit documentation (SOAP notes) | Encounter | 3 |
| `problems` | Active problem list (ICD-10) | Condition | 3 |
| `medications` | Active/historical medication list | MedicationStatement | 3 |
| `allergies` | Drug/food/environmental allergies | AllergyIntolerance | 3 |
| `vitals` | Vital signs history | Observation | 3 |
| `immunizations` | Vaccination records | Immunization | 3 |
| `lab_orders` | Lab order requests | ServiceRequest | 4 |
| `lab_results` | Parsed lab results (LOINC coded) | DiagnosticReport / Observation | 4 |
| `prescriptions` | e-Prescribing records | MedicationRequest | 5 |
| `claims` | Insurance claims (837P) | Claim | 6 |
| `payments` | Patient payments (Stripe) | PaymentNotice | 6 |
| `messages` | Secure messaging threads | Communication | 3/8 |
| `documents` | Uploaded files, external records | DocumentReference | 3 |
| `referrals` | Specialist referral tracking | ServiceRequest | 4 |

## Base Entity Pattern (all tenant-scoped tables)

```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id     UUID NOT NULL REFERENCES tenants(id)   -- RLS column
created_at    TIMESTAMPTZ DEFAULT now()
updated_at    TIMESTAMPTZ DEFAULT now()
created_by    UUID                                    -- User who created
is_active     BOOLEAN DEFAULT true                    -- Soft delete
```

## RLS Policy Pattern

```sql
ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON [table]
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY super_admin_bypass ON [table]
  USING (current_setting('app.super_admin', true)::boolean = true);
```

## Key Relationships
- `tenants` 1→N `patients`, `appointments`, `encounters`, etc.
- `patients` 1→N `encounters`, `medications`, `allergies`, `vitals`, `lab_results`
- `encounters` 1→N `lab_orders`, `prescriptions`, `referrals`
- `claims` N→1 `encounters`
- All entities scoped by `tenant_id` (unique constraints include tenant_id)

## Code Systems Referenced

| System | Usage |
|--------|-------|
| ICD-10-CM | Diagnosis codes (problem list, A&P, claims) |
| CPT | Procedure/billing codes |
| LOINC | Lab test/result codes |
| RxNorm | Medication codes |
| NDC | Drug product identifiers |
| SNOMED CT | Clinical findings (future — FHIR phase) |
| CVX | Vaccine codes (immunization registry) |
| X12 CARC/RARC | Claim denial reason codes |
