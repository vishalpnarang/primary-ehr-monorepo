# Primus EHR — Production Readiness Summary

**As of:** March 22, 2026
**Prepared by:** Thinkitive Technologies
**Product:** Primus — Multi-Tenant SaaS EHR for US Primary Care

---

## 1. Platform Overview

| Field | Detail |
|---|---|
| Product Name | Primus EHR |
| Company | Thinkitive Technologies |
| Market | USA — Primary care clinics (initial: Primus Demo Clinic, 3–4 locations) |
| Architecture | React frontend (5 portals) + Spring Boot 3 monolith (Java 21) + PostgreSQL (Aurora in prod) |
| Auth | Keycloak 24 on ECS Fargate |
| Hosting Target | AWS (ECS Fargate + Aurora + ALB + CloudFront) |
| Current Phase | Phase 1 complete — Auth + Tenants. Phase 2 (Patient + Scheduling) integrated. Backend spans 20 domains. |
| Portals | Provider, Patient, Employer, Affiliate, Broker |

---

## 2. Codebase Metrics

| Metric | Count |
|---|---|
| Frontend source files | 208 |
| Java backend source files | 548 |
| Git changesets | 28 |
| Database tables | 130+ |
| REST endpoints | 150+ |
| Frontend portals | 5 (provider, patient, employer, affiliate, broker) |
| Backend domain packages | 20 |
| Frontend tests | 70 |
| Backend tests | 32 (4 of 20 services covered) |
| E2E specs | 2 |
| Backend instruction coverage | ~8% |

---

## 3. What's Built — Backend Domain Inventory

| # | Domain Package | Tables | Endpoints | Key Features |
|---|---|---|---|---|
| 1 | auth | users, roles, permissions, refresh_tokens | 8 | Keycloak JWT, RBAC, role-switch, /me |
| 2 | tenant | tenants, tenant_configs, tenant_locations | 6 | Multi-tenant provisioning, RLS-ready, slug lookup |
| 3 | patient | patients, allergies, problems, vitals, flags, emergency_contacts | 18 | CRUD, timeline, search, history subresources |
| 4 | appointment | appointments, appointment_types, availability, block_days | 12 | Scheduling, status machine, available slots, today view |
| 5 | encounter | encounters, encounter_diagnoses, encounter_procedures, encounter_comments | 10 | SOAP notes, sign/lock, ICD-10 & CPT attach |
| 6 | prescription | prescriptions, drug_interactions | 6 | Create, send to pharmacy, interaction check |
| 7 | lab | lab_order_sets, lab_catalog, poc_results | 8 | POC results recording, order sets, catalog search |
| 8 | orders | lab_orders, imaging_orders, referral_orders | 6 | Order creation by type, patient order history |
| 9 | billing | claims, ar_aging, payments, kpi | 10 | Claims lifecycle, AR aging, KPI dashboard, patient balance |
| 10 | invoice | invoices, invoice_line_items | 8 | Patient invoicing, line items, send, void |
| 11 | payment | payments, payment_methods | 6 | Record payment, Stripe-ready methods, patient history |
| 12 | messaging | message_threads, messages | 8 | Secure provider↔patient messaging, unread count |
| 13 | inbox | inbox_items | 4 | Unified clinical inbox, action, archive, counts |
| 14 | notification | notifications, notification_preferences, device_tokens, email_templates | 8 | Push/email notifications, preferences, log |
| 15 | care_plan | care_plans, care_goals | 6 | Care plan CRUD, goal tracking per patient |
| 16 | formulary | formulary_items, drug_intolerances | 6 | Drug search, intolerances per patient |
| 17 | inventory | inventory_items, inventory_transactions | 6 | In-clinic supply tracking, low-stock alert |
| 18 | plan | membership_plans, plan_enrollments | 6 | DPC/concierge plan management, enrollment |
| 19 | rbac | roles, permissions, feature_flags | 6 | Role/permission matrix, feature flag toggle |
| 20 | analytics | dashboards, reports, report_runs | 8 | Patient volume, revenue stats, report execution |
| | **ALSO** | crm (tickets/leads/campaigns), employer (employers/employees), directory (pharmacies/contacts), scheduling_admin, clinical_templates, form_templates, questionnaires | 18+ | CRM, employer management, clinical macros, intake forms |

**Total: 130+ tables, 150+ endpoints across 20+ domain packages**

---

## 4. Production Readiness Checklist

### READY (green — done)

**Backend**
- [x] Spring Boot 3 monolith with DDD package structure (20 domains)
- [x] Keycloak 24 JWT authentication — login, /me, role-switch
- [x] Multi-tenant header routing (X-TENANT-ID on every request)
- [x] PostgreSQL schema — 130+ tables, FK integrity, indexes on patient/tenant IDs
- [x] REST API — 150+ endpoints, consistent `ApiResponse<T>` envelope
- [x] All 20 domain service/controller/repository layers scaffolded
- [x] CORS configured for all 5 portal origins
- [x] Global exception handler — structured error responses
- [x] `@Transactional` on all mutating service methods
- [x] Docker Compose — Spring Boot + Keycloak + PostgreSQL + pgAdmin one-command local stack

**Frontend**
- [x] 5 React portals — Provider, Patient, Employer, Affiliate, Broker
- [x] All portals: axios API client with JWT Bearer + X-TENANT-ID interceptors
- [x] All portals: TanStack Query hooks with mock fallback pattern (`?? mockData`)
- [x] Provider portal: full feature set — scheduling, charting, prescribing, billing, messaging, inbox, settings
- [x] Patient portal: appointments, records, messaging, billing, profile, telehealth placeholder
- [x] Employer portal: dashboard, employees, invoices, memberships, settings
- [x] Affiliate portal: dashboard, referred patients, payments, settings
- [x] Broker portal: dashboard, employer accounts, commissions, settings
- [x] Zustand auth stores for all 5 portals
- [x] React Query providers wired in all portal App.tsx files
- [x] Skeleton loaders on all data-dependent views
- [x] Empty states on all list views
- [x] Role-aware UI in provider portal (RBAC per role)

**Testing**
- [x] 70 frontend unit tests (Vitest + Testing Library)
- [x] 32 backend unit tests (JUnit 5 + Mockito) — 4 services covered
- [x] 2 Playwright E2E specs
- [x] CI runs all tests on push

**CI/CD**
- [x] GitHub Actions pipeline — build + test + Docker image push
- [x] Dockerfile for Spring Boot (multi-stage, JRE 21 slim)
- [x] docker-compose.yml — full local dev stack

**Infrastructure (code ready, not applied)**
- [x] Terraform modules written — ECS Fargate, Aurora PostgreSQL, ALB, ECR, VPC
- [x] Environment variable configuration via `.env` + `application.yml` profiles
- [x] Keycloak realm export — importable to any environment

**Security**
- [x] JWT validation on all protected endpoints via Spring Security
- [x] Role-based method security (`@PreAuthorize`)
- [x] Password flows through Keycloak — no plaintext passwords in Spring
- [x] HTTPS enforced in Nginx/ALB config (local dev uses HTTP)

**Documentation**
- [x] PRD, user personas, feature map, user flows, information architecture
- [x] Architecture docs — tech stack, system design, multi-tenancy, data model, API contracts, auth strategy
- [x] Design system + component library specs
- [x] CHANGELOG tracking all 28 sessions
- [x] Demo guide with credentials

---

### NEEDS WORK (yellow — before production)

| Item | Risk | Effort |
|---|---|---|
| Row-Level Security (RLS) PostgreSQL policies | HIGH — tenants could cross-read data | 1 week |
| Penetration testing / OWASP audit | HIGH — HIPAA requirement | 2–3 weeks (external) |
| HIPAA BAA with AWS | HIGH — mandatory for PHI in cloud | 1 day (process) |
| Integration tests (service layer, full API) | HIGH — 8% coverage is too low for prod | 2 weeks |
| Real integration credentials — Twilio, Stripe, Quest, Availity, ScriptSure | HIGH — all mocked today | 1–2 weeks per integration |
| Observability — CloudWatch metrics, distributed tracing (X-Ray), alerting | MEDIUM — blind in production | 1 week |
| Load testing — target: 100 concurrent users, sub-500ms p95 | MEDIUM — unknown performance floor | 3 days |
| Refresh token rotation and silent re-auth | MEDIUM — sessions expire today with no renewal | 2 days |
| HIPAA audit logging — who accessed what PHI, when | HIGH — required for HIPAA compliance | 1 week |
| Patient consent management — data sharing, marketing opt-out | MEDIUM — required for HIPAA | 3 days |
| Error tracking — Sentry or equivalent | MEDIUM — unobservable production errors | 1 day |
| Database connection pool tuning (HikariCP) | MEDIUM — default pool size inadequate at scale | 1 day |
| Frontend bundle analysis + code splitting | LOW — initial load performance | 1 day |

---

### NOT STARTED (red — required for go-live)

| Item | Blocker? | Notes |
|---|---|---|
| `terraform apply` — provision real AWS infra | YES | Terraform code written; needs AWS account, credentials, and state backend (S3) |
| DNS — configure custom domain (e.g., app.primusehr.com) | YES | Route 53 + ACM SSL certificate |
| WAF (AWS WAF) — rate limiting, geo-blocking, OWASP rules | YES | HIPAA best practice |
| CloudFront — CDN for frontend assets | NO | Performance + cost optimization |
| Flyway database migrations — version-controlled schema | YES | No migration tooling today; manual DDL only |
| Secrets management — AWS Secrets Manager or Parameter Store | YES | DB passwords and API keys in `.env` today |
| Multi-AZ Aurora setup | YES | Single-AZ today; prod requires HA |
| Automated backup and restore testing | YES | RTO/RPO undefined |
| SOC 2 Type II audit | NO | Required for enterprise customers |
| HITRUST certification | NO | Required for some health plan integrations |
| Business Associate Agreements with all vendors | YES | Twilio, Stripe, AWS, Quest, ScriptSure |
| Staff security awareness training | YES | HIPAA administrative safeguard |
| Incident response plan | YES | HIPAA requirement |
| Patient portal WCAG 2.1 AA audit | YES | Legal requirement (ADA) |

---

## 5. Architecture Diagram (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENTS (BROWSERS)                               │
│  Provider   Patient   Employer   Affiliate   Broker                         │
│  :5173      :5174     :5175      :5176        :5177                         │
│  (React + Vite + Tailwind + TanStack Query + Zustand)                       │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │ HTTPS (ALB in prod / localhost in dev)
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SPRING BOOT 3 MONOLITH  :8080                            │
│                                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Auth   │  │ Patient  │  │  Appt    │  │Encounter │  │ Billing  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Lab    │  │  Rx/Rx   │  │Messaging │  │Analytics │  │   RBAC   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ CarePlan │  │Formulary │  │Inventory │  │  Plans   │  │  CRM     │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                                             │
│  Spring Security ─ Keycloak JWT validation on every request                 │
│  X-TENANT-ID header ─ tenant routing on every request                      │
└──────────────────┬──────────────────────┬───────────────────────────────────┘
                   │                      │
          ┌────────▼────────┐   ┌─────────▼─────────┐
          │  PostgreSQL :5432│   │  Keycloak  :8180   │
          │  (Aurora prod)  │   │  (ECS Fargate prod)│
          │  130+ tables    │   │  primus realm      │
          │  RLS-ready      │   │  PKCE + ROPC flows │
          └─────────────────┘   └────────────────────┘

  PRODUCTION TARGET (AWS):
  Route53 → CloudFront → ALB → ECS Fargate (Spring Boot)
                              → ECS Fargate (Keycloak)
                              → Aurora PostgreSQL (Multi-AZ)
                              → S3 (frontend static assets)
```

---

## 6. Cost Estimate

| Environment | Monthly Cost | Notes |
|---|---|---|
| **Development** (local Docker) | $0 | Everything runs on localhost |
| **Staging** (AWS, single-AZ) | $150–200/mo | t3.small ECS tasks, db.t3.micro Aurora, minimal traffic |
| **Production** (AWS, multi-AZ, 1–3 clinics) | $500–700/mo | t3.medium ECS (2 tasks), db.t3.medium Aurora Multi-AZ, ALB, CloudFront, Keycloak ECS |
| **Scale** (AWS, 20+ tenants, 500+ concurrent) | $1,500–2,500/mo | t3.large/xlarge ECS auto-scaling, db.r6g.large Aurora, enhanced monitoring, WAF |

Key cost drivers: Aurora Multi-AZ ($200–350/mo at production scale), ECS tasks ($100–200/mo), ALB ($20/mo), CloudFront ($10–50/mo depending on traffic).

---

## 7. Test Coverage

| Layer | Tests | Coverage | Services Covered |
|---|---|---|---|
| Backend — JUnit 5 / Mockito | 32 tests | ~8% instruction | 4 of 20 services |
| Frontend — Vitest + Testing Library | 70 tests | Hooks, stores, API client | authStore, useApi, api.ts, key components |
| E2E — Playwright | 2 specs | Login + dashboard smoke | Provider portal login flow |

**Coverage gap:** 16 of 20 backend service classes have zero test coverage. Before production, minimum viable coverage target is 60% instruction coverage on the core clinical path: auth, patient, appointment, encounter, billing.

Priority order for new tests:
1. `PatientService` — highest data sensitivity
2. `AppointmentService` — highest transaction volume
3. `EncounterService` — HIPAA audit critical
4. `BillingService` — revenue impact
5. `AuthService` — security gate

---

## 8. Estimated Time to Production

| Week | Work | Owner |
|---|---|---|
| **Week 1** | Terraform apply, DNS, SSL cert, Aurora Multi-AZ, Secrets Manager, Flyway migrations | DevOps |
| **Week 2** | RLS policies, HIPAA audit logging, WAF rules, CloudFront, Sentry, CloudWatch alarms | Backend + DevOps |
| **Week 3** | Integration tests (auth + patient + appointment + encounter + billing), refresh token rotation, load test | Backend |
| **Week 4** | BAA execution (AWS, Twilio, Stripe, Quest), pen test kickoff, WCAG audit, staff training, go/no-go review | PM + Legal + QA |

**Total: 3–4 weeks** from today to a defensible production deployment for the first clinic tenant.

Post-launch (months 2–3): real integration credentials (Twilio, Stripe, Quest labs, ScriptSure, Availity), SOC 2 audit prep, HITRUST roadmap.
