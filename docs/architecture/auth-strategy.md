# Auth Strategy — Primus EHR

---

## Overview

Primus uses **Keycloak 24** for identity and access management. Each tenant gets a **dedicated Keycloak realm** — hard isolation between organizations. Spring Boot validates JWTs as an OAuth2 Resource Server. All authorization decisions are enforced at the API layer using Spring Security, with an additional Row-Level Security (RLS) layer at the database for data isolation.

---

## Architecture

```
Browser/App
    │
    ▼ OIDC Authorization Code + PKCE
Keycloak 24 (ECS Fargate)
  ├── Realm: primus-platform      → Super Admin realm
  ├── Realm: clinic-abc-health    → Tenant 1 realm
  ├── Realm: sunrise-family-med   → Tenant 2 realm
  └── Realm: [tenant-id]          → Each tenant gets own realm
    │
    ▼ JWT (RS256, 15-min access tokens)
Spring Boot Monolith
  ├── @PreAuthorize / Role checks
  ├── TenantContextHolder (tenant_id from JWT)
  └── PostgreSQL RLS (tenant_id verification)
```

---

## Keycloak Realm Strategy

| Realm | Purpose | Who manages |
|-------|---------|-------------|
| `primus-platform` | Super admin realm | Thinkitive staff only |
| `[tenant-slug]` | Per-tenant realm | Tenant Admin via UI / Super Admin |

**Per-tenant realm contains:**
- Client: `primus-provider-portal` (PKCE, SPA)
- Client: `primus-patient-portal` (PKCE, SPA)
- Client: `primus-backend` (service account, client credentials)
- Roles: `SUPER_ADMIN`, `TENANT_ADMIN`, `PRACTICE_ADMIN`, `PROVIDER`, `NURSE_MA`, `FRONT_DESK`, `BILLING`, `PATIENT`
- MFA: Required for all clinical roles (PROVIDER, NURSE_MA)
- Password policy: 12+ chars, uppercase, number, special char, 90-day expiry for clinical staff
- Session limits: 8-hour max session, 15-minute idle timeout (configurable per role)

---

## JWT Structure

### Access Token Claims

```json
{
  "sub": "user-uuid",
  "iss": "https://auth.primusehr.com/realms/clinic-abc-health",
  "aud": "primus-provider-portal",
  "exp": 1711650000,
  "iat": 1711649100,
  
  // Primus custom claims
  "tenant_id": "ten-00042",
  "tenant_slug": "clinic-abc-health",
  "user_id": "usr-10089",
  "display_name": "Dr. Emily Chen",
  "realm_access": {
    "roles": ["PROVIDER"]
  },
  "primus_roles": ["PROVIDER"],
  "location_ids": ["loc-001", "loc-002"],   // Locations this user has access to
  "provider_npi": "1234567890",              // For providers only
  "mfa_verified": true
}
```

### Token lifetimes

| Token type | Lifetime | Notes |
|------------|----------|-------|
| Access token | 15 minutes | Short-lived; refreshed silently by frontend |
| Refresh token | 8 hours | Session length for clinical staff |
| Refresh token (patient) | 30 days | Longer session for patient portal |
| ID token | 5 minutes | OIDC identity only |

---

## Roles and Permissions Matrix

### Legend
- ✅ Full access (read + write + delete)
- 👁 Read only
- ✏️ Read + write (no delete)
- ❌ No access
- 🔒 Own records only

| Permission | Super Admin | Tenant Admin | Practice Admin | Provider | Nurse/MA | Front Desk | Billing | Patient |
|-----------|-------------|-------------|----------------|----------|----------|------------|---------|---------|
| **PLATFORM** |
| Tenant CRUD | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Platform metrics | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| User impersonation | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Feature flags | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **TENANT SETTINGS** |
| Org profile | ✅ | ✅ | 👁 | ❌ | ❌ | ❌ | ❌ | ❌ |
| User management | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Role config | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Location management | ✅ | ✅ | ✏️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Integration credentials | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Fee schedules | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | 👁 | ❌ |
| Note templates | ✅ | ✅ | ✅ | ✏️ | ❌ | ❌ | ❌ | ❌ |
| **SCHEDULING** |
| View all schedules | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 👁 | ❌ |
| Create appointments | ✅ | ✅ | ✅ | ✏️ | ✏️ | ✅ | ❌ | 🔒 |
| Modify appointments | ✅ | ✅ | ✅ | ✏️ | ✏️ | ✅ | ❌ | 🔒 |
| Delete/cancel appts | ✅ | ✅ | ✅ | ✏️ | ❌ | ✅ | ❌ | 🔒 |
| Provider schedule config | ✅ | ✅ | ✅ | 🔒 | ❌ | ❌ | ❌ | ❌ |
| **PATIENT DATA** |
| View all patients | ✅ | ✅ | ✅ | ✅ | ✅ | 👁 | 👁 | 🔒 |
| Create new patient | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Edit demographics | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Delete patient (deactivate) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **CLINICAL RECORDS** |
| View encounters/notes | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | 👁 | 🔒 |
| Create/edit encounter | ✅ | ❌ | ❌ | ✅ | ✏️ | ❌ | ❌ | ❌ |
| Sign encounter | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Add addendum | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View problem list | ✅ | 👁 | ❌ | ✅ | ✅ | ❌ | ❌ | 🔒 |
| Edit problem list | ✅ | ❌ | ❌ | ✅ | ✏️ | ❌ | ❌ | ❌ |
| View medications | ✅ | 👁 | ❌ | ✅ | ✅ | ❌ | ❌ | 🔒 |
| Prescribe medications | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| EPCS (controlled Rx) | ✅ | ❌ | ❌ | ✅ (DEA registered) | ❌ | ❌ | ❌ | ❌ |
| View allergies | ✅ | 👁 | ❌ | ✅ | ✅ | ❌ | ❌ | 🔒 |
| Edit allergies | ✅ | ❌ | ❌ | ✅ | ✏️ | ❌ | ❌ | ❌ |
| Record vitals | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Place orders (lab/imaging) | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Review/sign lab results | ✅ | ❌ | ❌ | ✅ | 👁 | ❌ | ❌ | 🔒 |
| Create referrals | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View immunizations | ✅ | 👁 | ❌ | ✅ | ✅ | ❌ | ❌ | 🔒 |
| Add immunizations | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **BILLING AND CLAIMS** |
| View patient balance | ✅ | ✅ | 👁 | ❌ | ❌ | ✅ | ✅ | 🔒 |
| Collect payments | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Create/edit claims | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Submit claims | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Post payments/ERA | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Work denials | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| View billing reports | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Adjust fee schedules | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **MESSAGING** |
| Inbox (all messages) | ✅ | ✅ | 👁 | ✅ | ✅ | ❌ | ❌ | 🔒 |
| Send patient messages | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | 🔒 |
| Assign/delegate messages | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **REPORTS AND ANALYTICS** |
| Operational reports | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Financial reports | ✅ | ✅ | 👁 | ❌ | ❌ | ❌ | ✅ | ❌ |
| Clinical quality reports | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Provider productivity | ✅ | ✅ | ✅ | 🔒 | ❌ | ❌ | ❌ | ❌ |
| **AUDIT LOGS** |
| View platform audit | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View tenant audit | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View own audit trail | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Spring Security Implementation

```java
// TenantContextHolder — propagated from JWT
@Component
public class TenantContextHolder {
    private static final ThreadLocal<String> TENANT_ID = new ThreadLocal<>();
    
    public static void setTenantId(String tenantId) { TENANT_ID.set(tenantId); }
    public static String getTenantId() { return TENANT_ID.get(); }
    public static void clear() { TENANT_ID.remove(); }
}

// JWT filter extracts tenant_id and sets in context + Postgres session variable
@Component
public class TenantJwtFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, ...) {
        String tenantId = extractTenantId(jwt);
        TenantContextHolder.setTenantId(tenantId);
        
        // Set Postgres session variable for RLS
        entityManager.createNativeQuery(
            "SELECT set_config('app.current_tenant', :tenantId, true)"
        ).setParameter("tenantId", tenantId).getSingleResult();
        
        filterChain.doFilter(request, response);
    }
}
```

---

## Session Management

| Role | Idle timeout | Max session | MFA required |
|------|-------------|-------------|-------------|
| Super Admin | 15 min | 4 hours | ✅ TOTP |
| Tenant Admin | 15 min | 8 hours | ✅ TOTP |
| Provider | 15 min | 8 hours | ✅ TOTP |
| Nurse/MA | 15 min | 8 hours | ✅ TOTP |
| Front Desk | 20 min | 8 hours | Optional |
| Billing | 20 min | 8 hours | Optional |
| Practice Admin | 20 min | 8 hours | Optional |
| Patient | 30 min | 30 days | Optional (SMS OTP) |

---

## Local Development Auth

During Phase 0 (UI-only), a **mock auth system** bypasses Keycloak entirely:

```typescript
// Mock role switcher in development only
// Available in top-right corner of provider portal
const MOCK_ROLES = [
  'SUPER_ADMIN',
  'TENANT_ADMIN', 
  'PRACTICE_ADMIN',
  'PROVIDER',
  'NURSE_MA',
  'FRONT_DESK',
  'BILLING',
  'PATIENT'
];

// AuthContext provides mock user based on selected role
// Switching roles reloads dashboard with correct role-specific view
```
