# CLAUDE.md — Primus EHR Working Instructions

## What is Primus?

Primus is a multi-tenant SaaS EHR (Electronic Health Record) platform purpose-built for primary care clinics in the USA. It is being developed by Thinkitive Technologies. The product replaces Elation EMR for the initial client (Primary Plus, 3–4 clinic locations) and will expand to a full multi-tenant SaaS offering.

**Product name:** Primus  
**Company:** Thinkitive Technologies  
**Primary market:** USA — primary care clinics  
**Current phase:** UI-first — build complete React UI end to end, iterate, finalize, then implement backend phase by phase

---

## Project structure

```
primus/
├── CLAUDE.md                        ← you are here
├── docs/
│   ├── product/
│   │   ├── prd.md                   ← Product Requirements Document
│   │   ├── user-personas.md         ← All 8 roles, workflows, pain points
│   │   ├── feature-map.md           ← P0/P1/P2 feature matrix by module
│   │   ├── user-flows.md            ← Every click, every workflow
│   │   └── information-architecture.md ← Nav structure for both portals
│   ├── architecture/
│   │   ├── tech-stack.md            ← Stack decisions with rationale
│   │   ├── system-design.md         ← High-level design, service boundaries
│   │   ├── multi-tenancy.md         ← Tenant isolation, provisioning, RLS
│   │   ├── data-model.md            ← Complete entity-relationship model
│   │   ├── api-design.md            ← API conventions, versioning, error format
│   │   ├── api-contracts.md         ← Full endpoint catalog
│   │   ├── auth-strategy.md         ← Keycloak, RBAC, permissions matrix
│   │   ├── integration-strategy.md  ← All third-party integrations
│   │   └── deployment-strategy.md   ← Monolith → SaaS evolution, AWS
│   └── design/
│       ├── design-system.md         ← Colors, typography, spacing, WCAG AA
│       └── component-library.md     ← All shared components spec
└── apps/
    ├── provider-portal/             ← React + Vite + TypeScript (providers, staff)
    ├── patient-portal/              ← React + Vite + TypeScript (patients)
    └── shared/                      ← @primus/ui shared component library
```

---

## Current phase: UI-first

**Goal:** Build a complete, fully interactive React simulation of the entire EHR — every screen, every flow, every role — using mock data. No backend required yet. Test, iterate, and finalize UI before writing a single line of Spring Boot code.

**Rules for this phase:**
- Use **React + Vite + TypeScript** for both portals
- Use **Tailwind CSS** for styling — follow the design system in `docs/design/design-system.md`
- Use **mock data** — JSON files or in-memory stores. No real API calls yet
- All mock data must be **realistic healthcare data** — real-looking patient names, diagnoses, medications, CPT codes, ICD-10 codes
- Every screen must show **all states**: empty, loading skeleton, populated, error
- Components go in `apps/shared/` if they appear in more than one portal
- No component should have more than 300 lines. Extract sub-components aggressively
- Every route must be accessible from both keyboard and mouse
- Use **React Router v6** for routing
- Use **Zustand** for global state (auth context, tenant context, active patient)
- Use **React Query** (TanStack Query) for data fetching patterns — even with mocks, use the same patterns that will work with real APIs later

---

## Roles in scope

| Role | Portal | Description |
|------|--------|-------------|
| Super Admin | Provider portal | Thinkitive staff — manages all tenants |
| Tenant Admin | Provider portal | Clinic owner/manager — manages their org |
| Practice Admin | Provider portal | Office manager — daily ops |
| Provider (MD/NP/PA) | Provider portal | Clinical care, charting, prescribing |
| Nurse / MA | Provider portal | Rooming, vitals, clinical support |
| Front Desk | Provider portal | Scheduling, check-in, registration |
| Billing Staff | Provider portal | Claims, RCM, denials |
| Patient | Patient portal | Portal access only |

---

## Tech stack decisions (locked)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | React 18 + Vite + TypeScript | Same as Primary Plus reference |
| Styling | Tailwind CSS + shadcn/ui | Fast, accessible, consistent |
| State | Zustand + TanStack Query | Lightweight, scales to real API |
| Backend (Phase 2+) | Spring Boot 3 (Java 21) monolith | DDD structure, extractable to services |
| Database | PostgreSQL (Aurora in prod) | Proven, multi-tenant RLS ready |
| Auth | Keycloak 24 on ECS Fargate | Same as Primary Plus |
| Video (local) | Jitsi Docker | Free, zero cost for dev |
| Video (prod) | Amazon Chime SDK | Pay-per-use, $0 idle, HIPAA BAA |
| SMS | Twilio | Confirmed |
| Payments | Stripe | Confirmed |
| E-prescribing | ScriptSure (EPCS) | Confirmed |
| Labs | Quest + HL7 | Confirmed |
| Clearinghouse | Availity (primary) | Confirmed |
| IaC | Terraform | Same as Primary Plus |
| CI/CD | GitHub Actions | Same as Primary Plus |

---

## Design principles (non-negotiable)

1. **Single screen** — providers should complete 90% of tasks without leaving the patient chart
2. **Keyboard first** — every common action must have a keyboard shortcut; command palette is `Ctrl+K`
3. **3-click rule** — no common action should require more than 3 clicks
4. **Role-aware** — the same URL shows different UI/actions based on the logged-in role
5. **Zero alert fatigue** — interruptive modals only for life-threatening scenarios; max 5 per provider per day
6. **WCAG 2.1 AA** — all patient-facing components must pass; provider portal recommended
7. **Mobile responsive** — patient portal must work on mobile; provider portal optimized for desktop but functional on tablet

---

## Coding standards

```typescript
// File naming
ComponentName.tsx          // React components — PascalCase
useHookName.ts             // Custom hooks — camelCase with 'use' prefix
serviceName.service.ts     // Services — camelCase
types.ts / schema.ts       // Types and Zod schemas

// Component structure
export interface ComponentNameProps { ... }
export const ComponentName: React.FC<ComponentNameProps> = ({ ... }) => { ... }
export default ComponentName

// No default exports for hooks, services, utils — named exports only
// No 'any' types — use unknown and narrow
// All async functions must handle errors explicitly — no silent catches
```

---

## Mock data conventions

- Patient IDs: `PAT-XXXXX` (5 digits)
- Provider IDs: `PRV-XXXXX`
- Appointment IDs: `APT-XXXXX`
- Encounter IDs: `ENC-XXXXX`
- Tenant IDs: `TEN-XXXXX`
- Dates: ISO 8601 (`2026-03-18T14:30:00Z`)
- All mock data lives in `apps/[portal]/src/mocks/`
- Use realistic US addresses, phone numbers, and dates of birth

---

## Key UX patterns to implement

| Pattern | Implementation |
|---------|---------------|
| Command palette | `Ctrl+K` → searchable overlay across patients, actions, navigation |
| Keyboard shortcuts | Tier 1 global, Tier 2 chart context, Tier 3 form context |
| Patient chart tabs | Up to 5 open patients, `Ctrl+Tab` to cycle |
| Smart phrases | Type `.` prefix in note fields to expand templates |
| Inline expansion | Click any result to expand in-place — never navigate to new page |
| Sticky patient header | Always visible, never scrolls — shows allergies, risk flags, actions |
| Skeleton loading | Every data-dependent view must show skeleton before data loads |
| Empty states | Every list must have a purposeful empty state with action prompt |

---

## What NOT to build in the UI phase

- No real authentication — use a mock login with role switcher
- No real API calls — all data from mock JSON
- No payment processing UI yet (Stripe) — placeholder screens only
- No actual HL7 parsing — mock lab results only
- No real e-prescribing flow — mock Rx confirmation screens only

---

## Phase plan (high level)

| Phase | What |
|-------|------|
| **0 — UI** | Complete React simulation, all roles, all flows — current phase |
| **1 — Auth + Tenants** | Keycloak, RBAC, tenant provisioning, login |
| **2 — Patient + Scheduling** | Real patient records, appointments, calendar |
| **3 — EHR Core** | Encounters, notes, problem list, medications |
| **4 — Orders + Labs** | Lab ordering, HL7, results inbox |
| **5 — Prescribing** | ScriptSure EPCS integration |
| **6 — Billing + RCM** | Claims, Availity, ERA, Stripe |
| **7 — Telehealth** | Chime SDK integration |
| **8 — Notifications** | Twilio SMS, email, in-app |
| **9 — Analytics** | Reports, dashboards, HEDIS |
| **10 — SaaS hardening** | Multi-tenancy RLS, HIPAA audit, pen test, prod deploy |

Each phase: build → test → sign off → next phase. No phase starts until the previous is signed off.

---

## When updating docs

Whenever a UI design decision is finalized during iteration, update the corresponding doc:
- Design change → update `docs/design/design-system.md` or `docs/design/component-library.md`
- Feature added/removed → update `docs/product/feature-map.md` and `docs/product/user-flows.md`
- Architecture decision → update the relevant `docs/architecture/` file
- New integration decided → update `docs/architecture/integration-strategy.md`

Docs and code must stay in sync throughout the project.
