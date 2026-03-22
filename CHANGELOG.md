# Primus EHR — Changelog & Decision Log

## Quick Reference

| What | Where | Port | Status |
|------|-------|------|--------|
| Provider Portal | `apps/provider-portal/` | 5173 | Complete — wired to real API |
| Internal: Mgmt Deck | `/internal/management` | 5173 | Password: primus2026 |
| Internal: Client Deck | `/internal/client` | 5173 | Password: primus2026 |
| Internal: Demo Guide | `/internal/demo-guide` | 5173 | Password: primus2026 |
| Patient Portal | `apps/patient-portal/` | 5174 | Complete — wired to real API |
| Backend API | `backend/` | 8080 | Running — 540 Java files, 20+ controllers, 150+ endpoints |
| Swagger UI | — | 8080/swagger-ui | Live |
| PostgreSQL | Docker | 5432 | Running — 27 Liquibase changesets, 130+ tables |
| Keycloak | Docker | 8180 | Running, 8 users, full RBAC |
| Redis | Docker | 6379 | Running |
| Mailhog | Docker | 8025 | Running |
| SonarQube | Docker | 9000 | Running |
| GitHub Org | `github.com/primus-ehr` | — | 3 repos: primus, ui, infra |
| @primus-ehr/ui | GitHub Packages | — | Published |

---

## Session 11 — Phases 1–10 Complete (2026-03-22)

### What was done

#### Backend — Phases 1–10

**Phase 1 — RBAC + Auth**
- Keycloak realm JSON with tenant_id JWT mapper finalized
- Spring Security OAuth2 resource server wired — all endpoints secured
- `TenantContextFilter` extracts tenant from JWT claim, no hardcoding
- RBAC annotations on all controllers (`@PreAuthorize`)
- 8 Keycloak users seeded (Super Admin, Tenant Admin, Practice Admin, Provider, Nurse/MA, Front Desk, Billing, Patient)

**Phase 2 — Patient Enrichment + Scheduling**
- Patient CRUD with full demographics, insurance, emergency contacts
- Appointment scheduling with conflict detection (provider + room availability)
- FormBuilder domain: dynamic form definitions, submissions, form-to-chart population
- Clinical templates domain: SOAP templates, smart phrases, dot-phrase expansion

**Phase 3 — EHR Core + Care Plans**
- Encounter SOAP notes with structured ROS, PE, A&P sections
- Problem list management (ICD-10 coded, add/resolve/update)
- Medication list with dosage, frequency, prescriber, status
- Allergy list with reaction type and severity
- Vitals history with trend data
- Care plan builder: goals, interventions, outcomes, target dates

**Phase 4 — Labs + Orders**
- Lab order creation and result ingestion (Quest HL7 mock)
- Lab result trend visualization data
- Imaging orders and referral tracking
- Order history audit trail
- Critical value flagging

**Phase 5 — Formulary + Prescribing**
- Formulary management: drug catalog, coverage tiers, prior auth flags
- Drug-drug and drug-allergy interaction checks
- Prescription creation, refill requests, Rx history
- PDMP query tracking (mock integration stub)

**Phase 6 — Inventory + Billing**
- Inventory management: items, stock levels, usage tracking, low-stock alerts
- Invoice and payment domains: invoice generation, patient payments (Stripe stub)
- Charge capture from signed encounters
- Claim scrubbing and 837P generation
- ERA posting and denial queue
- A/R aging dashboard

**Phase 7–8 — Messaging + Notifications**
- Secure provider-to-provider and provider-to-patient messaging
- WebSocket STOMP/SockJS for real-time message delivery
- Notification domain: appointment reminders (SMS/email stubs), lab ready, secure message alerts
- In-app notification bell with unread count

**Phase 9 — Analytics + CRM**
- Analytics dashboard: provider productivity, revenue KPIs, HEDIS care gaps
- CRM domain: patient engagement tracking, outreach campaigns, lead management
- Employer health domain: employer accounts, employee panels, aggregate reporting
- Affiliate and broker management domains

**Phase 10 — SaaS Hardening**
- 27 Liquibase changesets creating 130+ tables with indexes and FK constraints
- Hibernate Envers audit logging on all PHI entities
- Row-level security groundwork (tenant_id filter on all queries)
- SonarQube integration with JaCoCo coverage

#### Frontend — All phases
- TanStack Query hooks for all 150+ API endpoints
- Axios client with JWT interceptor, tenant header, error handling
- All pages wired to real backend — no mock data fallback in production paths
- Patient Portal fully connected (Keycloak auth, all key pages)
- WebSocket hook (STOMP/SockJS) for real-time messaging

#### GitHub Org + CI/CD
- `primus-ehr` GitHub organization created
- 3 repositories: `primus-ehr/primus` (monorepo), `primus-ehr/ui` (@primus-ehr/ui package), `primus-ehr/infra` (Terraform)
- `@primus-ehr/ui` published to GitHub Packages (scoped package)
- GitHub Actions CI: lint + test + build on every PR, Docker image push on merge to main
- Branch protection on `main` for all 3 repos

#### Infrastructure
- Docker Compose updated: postgres, keycloak, redis, mailhog, sonarqube (5 services)
- Terraform updated for all new ECS services, secrets, RDS parameter groups
- Seed SQL updated with data for all 20 domains (130+ tables populated)
- Keycloak realm JSON updated with correct redirect URIs and client scopes

#### Bug fixes (E2E testing)
- Fixed `X-TENANT-ID` header mismatch — frontend now reads tenant_id from JWT, not hardcoded
- Fixed UUID vs String inconsistency across 83 files (standardized on String uuid)
- Fixed Liquibase checksum errors from out-of-order changeset edits
- Fixed CORS config to allow both portal origins (5173, 5174)
- Fixed Keycloak port conflict (moved to 8180, backend stays on 8080)
- Fixed missing `@Column` annotations on entity fields causing null inserts
- Fixed WebSocket STOMP destination prefix mismatch between client and server

### Test results
- Frontend: **70/70** tests pass
- Backend: **32/32** tests pass
- E2E: **172** Playwright scenarios ready (happy-path + master-flow specs)
- Total: **274 tests**

### Codebase stats (as of 2026-03-22)
- Total files: **750+**
- Total lines: **60,000+**
- Java files: **540** (20 domain packages, 20+ controllers, 150+ REST endpoints)
- React components: **100+**
- Database tables: **130+** (27 Liquibase changesets)
- Phases complete: **10/10**

---

## Session 10 — Complete Frontend-Backend Integration

### What was done
1. **Tenant ID from JWT** — no more hardcoded '1', extracted from Keycloak token claim
2. **WebSocket hook** — STOMP/SockJS client for real-time messaging
3. **Patient Portal fully connected** — Axios client, query hooks, Keycloak auth, all key pages wired
4. **Patient Portal login** — email/password form (pre-filled robert.johnson@email.com)
5. **All builds pass** — both portals + backend compile and test successfully

### Test results
- Frontend: **70/70** tests pass
- Backend: **32/32** tests pass
- Provider Portal: **builds ✓**
- Patient Portal: **builds ✓**

### Ready to test end-to-end
```bash
# Infrastructure (already running)
docker compose up -d

# Backend (already running)
cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Provider Portal
cd apps/provider-portal && npx vite  # http://localhost:5173

# Patient Portal
cd apps/patient-portal && npx vite   # http://localhost:5174

# Login credentials (password: password123)
# Provider: emily.chen@primusdemo.com
# Patient: robert.johnson@email.com
```

---

## Session 9 — Real Database Services

### What was done
1. **All 11 ServiceImpls rewritten** — real JPA repository calls, no more hardcoded mock returns
2. **Entity↔column mappings fixed** — @Column, @Table annotations aligned with Liquibase schema
3. **UUID/String standardized** — 83 files fixed, String uuid used consistently everywhere
4. **Seed data loaded** — 10 patients, 10 appointments, 10 problems, 9 medications, 5 allergies, 4 users, 2 locations in real PostgreSQL
5. **All tests passing** — 32 backend unit tests, BUILD SUCCESS
6. **APIs verified against real DB** — patients, appointments, dashboard, billing, settings all return 200 with real data

### Key insight
- Tenant ID from seed data is `5` (auto-incremented), not `1` — frontend header `X-TENANT-ID` must match
- Backend uses `X-TENANT-ID` header for tenant isolation
- All queries filter by `tenant_id AND archive = false`

### Verified endpoints (all 200 with real DB data)
- `GET /api/v1/patients` — 10 patients from PostgreSQL
- `GET /api/v1/appointments/today` — today's appointments
- `GET /api/v1/dashboard/provider` — real counts
- `GET /api/v1/billing/kpi` — calculated from claims
- `GET /api/v1/settings/organization` — tenant info

---

## Session 1 — Phase 0 Frontend (Initial Build)

### What was done
1. **Project setup** — Monorepo with npm workspaces, Vite, TypeScript, Tailwind CSS
2. **Shared library** (`apps/shared/`) — 21 React components, full type system, mock data, utility hooks
3. **Provider Portal** — 10 pages (Login, Dashboard, Schedule, Patients, Patient Chart, Encounter Editor, Inbox, Billing, Reports, Settings)
4. **Patient Portal** — 9 pages (Login, Home, Appointments, Messages, Records, Billing, Payment, Profile, New Appointment)
5. **Command Palette** — Ctrl+K fuzzy search across patients, actions, navigation

### Key decisions
- Tab-based patient chart layout (later changed to card-grid)
- Dark navy sidebar (later changed to white)
- 8px font sizes used (later increased to 10px minimum)

---

## Session 2 — UI Redesign (Card Grid + Density)

### What was done
1. **Patient Chart redesigned** — Card-grid layout (4 columns) showing all sections at once, right-side Action Panel (Labs/Tasks/Messages)
2. **Encounter Editor redesigned** — 3-column layout (clinical sidebar + SOAP editor + section nav)
3. **Dashboard rebuilt** — Trading-terminal density across all 7 roles
4. **Color scheme overhauled** — Navy sidebar → white, muted pastel badges, unified blue-600 primary
5. **Font sizes fixed** — All text-[8px]/text-[9px] → text-[10px]/text-[11px]
6. **Layout bugs fixed** — Double scrollbar, z-index on schedule drawer, negative margin mismatches

### Key decisions
- Card-grid over tab navigation (user preference from reference screenshots)
- White sidebar with blue accent (matching modern SaaS aesthetic)
- Restrained color palette: blue-600 primary, slate neutrals, muted rose/emerald/amber for status
- Vercel React best practices adopted (module-level components, useMemo, ternary rendering)

---

## Session 3 — Complete All Screens

### What was done
1. **Provider Portal completed** — Added NewPatientPage (3-step wizard), NewAppointmentPage, CheckInPage (5-step), RoomingPage (7-step MA checklist), TenantProvisioningPage (4-step)
2. **Patient Portal completed** — Added WelcomePage, RegisterPage, AppointmentDetailPage, TelehealthPage (4-state video flow), IntakeFormPage, VisitDetailPage, LabDetailPage
3. **Components added** — RxSlideOver (drug search + interaction check), OrderSlideOver (Lab/Imaging/Referral), PatientTabBar, ErrorBoundary, ConfirmDialog, CriticalAlertModal
4. **Shared API layer** — `apps/shared/src/mocks/api/` — unified mock API used by both portals
5. **All placeholder content replaced** — Billing (Charges, ERA, A/R, Patient Balances), Settings (all 14 sub-views), PatientChart (Notes, Medication, Orders, Referrals, Questionnaires, Demographics)
6. **Keyboard shortcuts wired** — Ctrl+K, Ctrl+1-7 sidebar navigation
7. **Mobile responsive** — Provider sidebar hidden on mobile, card grid responsive, patient portal already mobile-first

### Key decisions
- Provider portal: 15 pages final, 7 components
- Patient portal: 16 pages final
- Total frontend: 96 TypeScript files, ~26,000 lines

---

## Session 4 — Backend Build

### What was done
1. **Spring Boot 3.4.4 + Java 21** DDD monolith — 12 domain packages
2. **172 Java files** — 14 controllers, 11 services, 29 entities, 27 repositories, 63 DTOs
3. **Liquibase migrations** — 8 changesets creating 30+ tables with indexes
4. **WebSocket** — STOMP/SockJS for real-time messaging + typing indicators
5. **Security** — OAuth2 Resource Server (Keycloak JWT), tenant filter, CORS
6. **Docker Compose** — Postgres 16, Keycloak 24, Redis 7, Mailhog
7. **Compilation fix** — Lombok annotation processor path in pom.xml

### Key decisions
- DDD monolith (not microservices) — extractable later
- REST (not GraphQL) — simpler for V1
- WebSocket for messaging (not polling)
- Shared DB with tenant_id column (not separate schemas)
- Hibernate Envers for audit logging

---

## Session 5 — Infrastructure Running

### What was done
1. **Docker stack started** — All 4 containers healthy
2. **Keycloak configured** — Realm "primus", 8 users, 8 roles, 2 clients (public + confidential)
3. **Backend started** — Liquibase ran all migrations, API responding on :8080
4. **Auth verified end-to-end** — Login → JWT token → API call → 200 with data
5. **Swagger UI live** — All endpoints documented

### Key decisions
- Keycloak port 8180 (not 8080, avoids conflict with backend)
- primus-frontend client is public (PKCE) — no secret in browser
- primus-backend client is confidential — for server-to-server calls
- Password for all test users: password123

---

## Session 6 — Demo Infrastructure

### What was done
1. **Seed data SQL** (1,166 lines) — All dates relative to CURRENT_DATE, always fresh
2. **Keycloak realm JSON** — Importable with --import-realm, includes tenant_id JWT mapper
3. **Pitch deck** (HTML) — 9-slide scrolling presentation for clients
4. **Demo guide** (HTML) — Credentials, 5 demo flows, troubleshooting
5. **Terraform** (14 files) — VPC, Aurora Serverless v2, ECS Fargate, ALB, S3+CloudFront
6. **Deploy/destroy scripts** — One-command spin-up and teardown
7. **Dockerfile** — Multi-stage layered JAR build

### Key decisions
- Demo infra is the PRIMARY GOAL — one-click spin-up/spin-down for client demos
- All seed data uses relative dates — never stale
- Terraform destroy = $0 cost
- Estimated running cost: ~$75-90/month

---

## What's NOT done yet

## Session 8 — API Wiring + Testing Infrastructure

### What was done
1. **Axios API client** (`lib/api.ts`) — typed functions for all 12 domains, JWT + tenant interceptors
2. **Keycloak auth flow** — login via password grant, JWT stored in sessionStorage, mock fallback
3. **TanStack Query hooks** (`hooks/useApi.ts`) — 25+ hooks wrapping every backend endpoint
4. **All key pages wired** — Dashboard, Schedule, Patients, PatientChart, Inbox, Billing, Settings try real API first, fall back to inline mock data
5. **Frontend testing** — Vitest + React Testing Library: 4 files, 70 tests, ALL PASS
6. **Backend testing** — JUnit 5 + Mockito: 5 files, 32 tests, ALL PASS
7. **E2E testing** — Playwright config + 4 spec files (auth, navigation, patient-chart, patient-portal)
8. **SonarQube** — Docker service, sonar-project.properties, JaCoCo coverage plugin

### Test results
- Frontend: **70/70 pass** (auth store, command palette, API client, query hooks)
- Backend: **32/32 pass** (patient, appointment, encounter, billing, exception handler)
- E2E: 4 spec files ready

---

## Session 7 — Internal Portal (Pitch Decks + Demo Guide)

### What was done
1. **Password-protected internal routes** at `/internal/*` — gate uses sessionStorage, password: `primus2026`
2. **Management pitch deck** (`/internal/management`) — 10-slide scroll-snap presentation: Market Opportunity, Product, Features, Architecture, Build Progress, Roadmap, Unit Economics, Go-to-Market, Team
3. **Client pitch deck** (`/internal/client`) — 9-slide prospect-facing deck: Problem, Solution, Feature Tour, Comparison vs legacy EHR/athena/Epic, Security, Implementation Timeline, Pricing, Demo Request
4. **Demo & testing guide** (`/internal/demo-guide`) — Credentials table, 5 demo flows, API curl examples, key URLs, troubleshooting FAQ
5. **Moved pitch deck and demo guide from standalone HTML to React pages** inside the provider portal

### Key decisions
- Internal pages are part of the frontend app (not standalone HTML) — deployable with the same build
- Password-gated via sessionStorage (not Keycloak) — separate from EHR auth
- Management deck includes costs/architecture; Client deck is value-focused only
- After every milestone: update CHANGELOG, pitch deck stats, seed data, terraform, memory

---

## What's NOT done yet (post Phase 10 — vendor integrations + production)

### Vendor integrations (need contracts / accounts)
- [ ] Quest Labs HL7 live feed — needs vendor contract and IP whitelisting
- [ ] ScriptSure EPCS — needs vendor contract + DEA audit + 2FA hardware
- [ ] Availity EDI live submission — needs registration and trading partner agreement
- [ ] Stripe live payments — needs Stripe account + HIPAA BAA
- [ ] Twilio SMS live — needs account + A2P 10DLC registration
- [ ] Amazon Chime SDK live — needs AWS account setup + HIPAA BAA
- [ ] Bamboo Health PDMP — needs state-level integration agreements

### Production hardening
- [ ] PostgreSQL Row-Level Security enforcement at DB layer
- [ ] HIPAA audit log 7-year retention in S3 Glacier
- [ ] FHIR R4 APIs (ONC 21st Century Cures Act compliance)
- [ ] Penetration testing (annual requirement)
- [ ] SOC 2 Type II audit readiness
- [ ] BAA execution with all cloud vendors (AWS, Twilio, Stripe, Mailgun)
- [ ] Disaster recovery runbook + RTO/RPO testing

### Nice-to-have future features
- [ ] AI ambient documentation (Suki/Nabla partnership)
- [ ] Voice dictation (Web Speech API)
- [ ] Kiosk self-check-in flow
- [ ] FHIR-based electronic prior authorization (DaVinci PAS — mandated Jan 2027)
- [ ] SDOH screening (PRAPARE tool) + community resource referral
- [ ] Custom report builder (drag-and-drop)
- [ ] Immunization registry reporting (HL7 VXU to state IIS)
