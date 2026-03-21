# Primus EHR — Overview

## Product
- **Name:** Primus
- **Company:** Thinkitive Technologies
- **Domain:** Multi-tenant SaaS EHR for US primary care clinics
- **Initial client:** Primary Plus (3-4 clinic locations, migrating from Elation EMR)
- **Target:** 50+ primary care practices (SaaS expansion)
- **Current phase:** Phase 0 — UI-first (React simulation with mock data, no backend)

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React 18 + Vite 5 + TypeScript 5 |
| Styling | Tailwind CSS 3 + shadcn/ui (Radix primitives) |
| State | Zustand 4 (global) + TanStack Query 5 (server state) |
| Routing | React Router 6 |
| Forms | React Hook Form + Zod |
| Icons | lucide-react |
| Charts | Recharts |
| HTTP | Axios |
| Backend (Phase 2+) | Spring Boot 3 / Java 21, DDD monolith |
| Database | PostgreSQL 16 (Aurora in prod), shared DB + RLS multi-tenancy |
| Auth | Keycloak 24, OIDC + PKCE, realm-per-tenant |
| IaC | Terraform |
| CI/CD | GitHub Actions |
| Observability | Grafana + Loki + Tempo + Sentry (self-hosted) |

## Architecture

- **Two React apps:** `apps/provider-portal` (all staff) + `apps/patient-portal` (patients)
- **Shared library:** `apps/shared` (`@primus/ui`)
- **Backend:** DDD monolith with 13 domain packages (auth, tenant, patient, scheduling, encounter, order, prescription, billing, notification, messaging, telehealth, analytics, integration)
- **Multi-tenancy:** Shared DB + `tenant_id` column + PostgreSQL RLS + Keycloak realm-per-tenant
- **Deployment evolution:** Docker local → EC2 single server ($150/mo) → ECS Fargate ($500-700/mo) → Multi-env SaaS ($1-2K/mo)

## Roles (8)

| Role | Portal | Priority |
|------|--------|----------|
| Super Admin | Provider | P0 |
| Tenant Admin | Provider | P1 |
| Practice Admin | Provider | P1 |
| Provider (MD/NP/PA) | Provider | P0 |
| Nurse / MA | Provider | P0 |
| Front Desk | Provider | P0 |
| Billing Staff | Provider | P1 |
| Patient | Patient | P1 |

## Key Design Principles
1. Single-screen clinical workflow (90% of tasks from patient chart)
2. Keyboard-first (`Ctrl+K` command palette, shortcuts for every action)
3. 3-click rule for all common actions
4. Role-aware UI (same URL, different view per role)
5. Zero alert fatigue (max 5 interruptive modals/day)
6. WCAG 2.1 AA (required for patient portal, recommended for provider)
7. Mobile responsive (patient portal mobile-first, provider desktop-first)

## Integrations (12)

| Integration | Protocol | Phase |
|-------------|----------|-------|
| ScriptSure (e-Rx/EPCS) | HTTPS REST | 5 |
| Quest/Tribal Labs | HL7 v2 (OML/ORU) | 4 |
| VaxCare (immunizations) | HL7 v2 (ADT/VXU) | 4 |
| Availity (claims) | X12 EDI (837P/270/271/835) | 6 |
| Stripe (payments) | HTTPS REST + webhooks | 6 |
| Twilio (SMS) | HTTPS REST | 8 |
| AWS SES (email) | AWS SDK | 8 |
| Jitsi/Chime (video) | WebRTC | 7 |
| Google Maps | HTTPS REST | 2 |
| Firebase (push) | HTTPS REST | 8 |
| Superset (analytics) | Embedded SDK | 9 |

## Phase Plan
| Phase | Scope |
|-------|-------|
| 0 (current) | Complete React UI simulation, all roles, all flows, mock data |
| 1 | Auth + Keycloak + tenants + RBAC |
| 2 | Patient records + scheduling + registration |
| 3 | EHR core — encounters, notes, problem list, meds |
| 4 | Orders + labs (HL7) |
| 5 | e-Prescribing (ScriptSure EPCS) |
| 6 | Billing + RCM (Availity, Stripe) |
| 7 | Telehealth (Chime SDK) |
| 8 | Notifications (Twilio, SES) |
| 9 | Analytics + population health |
| 10 | SaaS hardening, FHIR, SOC 2, HIPAA audit |

## Codebase Status
- **Code:** None yet — docs only (14 markdown files)
- **Docs:** PRD, user personas, feature map, user flows, information architecture, tech stack, auth strategy, multi-tenancy, integration strategy, deployment strategy, design system, component library
- **Pending docs:** data model, API design, API contracts, system design
