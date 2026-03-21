# Primus EHR — Changelog & Decision Log

## Quick Reference

| What | Where | Port | Status |
|------|-------|------|--------|
| Provider Portal | `apps/provider-portal/` | 5173 | UI complete (mock data) |
| Internal: Mgmt Deck | `/internal/management` | 5173 | Password: primus2026 |
| Internal: Client Deck | `/internal/client` | 5173 | Password: primus2026 |
| Internal: Demo Guide | `/internal/demo-guide` | 5173 | Password: primus2026 |
| Patient Portal | `apps/patient-portal/` | 5174 | UI complete (mock data) |
| Backend API | `backend/` | 8080 | Running, 14 controllers |
| Swagger UI | — | 8080/swagger-ui | Live |
| PostgreSQL | Docker | 5432 | Running, 30+ tables |
| Keycloak | Docker | 8180 | Running, 8 users |
| Redis | Docker | 6379 | Running |
| Mailhog | Docker | 8025 | Running |

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

## Session 7 — Internal Portal (Pitch Decks + Demo Guide)

### What was done
1. **Password-protected internal routes** at `/internal/*` — gate uses sessionStorage, password: `primus2026`
2. **Management pitch deck** (`/internal/management`) — 10-slide scroll-snap presentation: Market Opportunity, Product, Features, Architecture, Build Progress, Roadmap, Unit Economics, Go-to-Market, Team
3. **Client pitch deck** (`/internal/client`) — 9-slide prospect-facing deck: Problem, Solution, Feature Tour, Comparison vs Elation/athena/Epic, Security, Implementation Timeline, Pricing, Demo Request
4. **Demo & testing guide** (`/internal/demo-guide`) — Credentials table, 5 demo flows, API curl examples, key URLs, troubleshooting FAQ
5. **Moved pitch deck and demo guide from standalone HTML to React pages** inside the provider portal

### Key decisions
- Internal pages are part of the frontend app (not standalone HTML) — deployable with the same build
- Password-gated via sessionStorage (not Keycloak) — separate from EHR auth
- Management deck includes costs/architecture; Client deck is value-focused only
- After every milestone: update CHANGELOG, pitch deck stats, seed data, terraform, memory

---

## What's NOT done yet

### Frontend → Backend wiring
- [ ] Replace mock data with real API calls (Axios + TanStack Query)
- [ ] Real login flow via Keycloak OIDC
- [ ] WebSocket connection for live messaging

### Backend features
- [ ] Patient CRUD against real DB (currently returns mock data from service impls)
- [ ] Appointment conflict detection with real queries
- [ ] Encounter auto-save and signing with audit log
- [ ] File upload (S3) for documents and insurance cards

### Integrations (Phase 4+)
- [ ] Quest Labs HL7 — needs vendor contract
- [ ] ScriptSure EPCS — needs vendor contract + DEA audit
- [ ] Availity EDI — needs registration
- [ ] Stripe payments — needs account
- [ ] Twilio SMS — needs account
- [ ] Amazon Chime SDK — needs setup

### Production hardening (Phase 10)
- [ ] Row-Level Security at PostgreSQL layer
- [ ] HIPAA audit log with 7-year retention
- [ ] FHIR R4 APIs
- [ ] Penetration testing
- [ ] SOC 2 readiness
