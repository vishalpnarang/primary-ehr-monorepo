# Patterns and Conventions — Primus EHR

## File Naming
- `ComponentName.tsx` — React components (PascalCase)
- `useHookName.ts` — Custom hooks (camelCase with `use` prefix)
- `serviceName.service.ts` — Services (camelCase)
- `types.ts` / `schema.ts` — Types and Zod schemas

## Component Rules
- Max 300 lines per component — extract sub-components aggressively
- Shared components in `apps/shared/` if used in more than one portal
- Named exports for hooks, services, utils (no default exports)
- Default exports for page components only
- All async functions must handle errors explicitly — no silent catches

## TypeScript
- No `any` types — use `unknown` and narrow
- Export interface alongside component: `ComponentNameProps`
- Zod schemas for runtime validation

## State Management
- **Zustand:** Auth context, tenant context, active patient, UI state
- **TanStack Query:** All data fetching (use same patterns that map to real APIs)
- Mock data in `apps/[portal]/src/mocks/`

## UI Patterns
- **Command palette** (`Ctrl+K`): Global search across patients, actions, navigation
- **Slide-over panels**: Rx, orders, messages open as right drawer — never navigate away
- **Inline expansion**: Click list item → expand in-place with slide-down
- **Sticky patient header**: Always visible (name, DOB, MRN, allergies, risk flags, actions)
- **Skeleton loading**: Every async view shows skeleton before data loads
- **Empty states**: Every list has purposeful empty state with action prompt
- **Toast notifications**: Bottom-right, max 3 stacked, 4s auto-dismiss

## Clinical Display
- **Monospace font** for MRNs, DOBs, lab values, dosages, CPT/ICD-10 codes (JetBrains Mono)
- **14px minimum** for any patient health data
- **Never color alone** for clinical severity — always icon + color + text
- Lab values: Normal=black, Low=amber+↓, High=amber+↑, Critical=red+▲+bold

## Accessibility
- All interactive elements keyboard focusable
- 2px focus outline in `primus-blue-500`
- ARIA labels on all form inputs and icons
- Focus trap in modals, return focus on close
- `prefers-reduced-motion` respected

## Backend Patterns (Phase 1+)
- DDD package structure: `domain/`, `application/`, `infrastructure/`, `api/` per domain
- `TenantEntity` base class auto-sets `tenant_id` via `@PrePersist`
- `TenantAwareRepository` enables Hibernate `tenantFilter`
- `TenantJwtFilter` sets PostgreSQL RLS session variable
- All external calls wrapped with Resilience4j circuit breaker
- Adapter pattern for all integrations (swap provider without changing business logic)
- Credentials in AWS Secrets Manager: `primus/{env}/{tenant_id}/{integration}`

## Logging (mandatory format)
```
[timestamp] [traceId] [spanId] [tenantId] [userId] [service] [method] [path] [status] [duration_ms]
```

## Healthcare-Specific Patterns
- **PHI rule:** Zero PHI in SMS/email — notification-only with portal link
- **Audit logging:** All PHI access logged to `audit_log` table (7-year retention)
- **HIPAA consent:** Digital signature at patient registration
- **Critical lab alerts:** Tier-1 interruptive modal requiring explicit acknowledgment
- **EPCS:** 2FA required for every controlled substance prescription
- **PDMP:** Automatic query before controlled substance prescribing
