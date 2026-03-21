# Tech Stack — Primus EHR

**Philosophy:** Start with the simplest architecture that can evolve. Monolith-first with DDD structure so individual modules can be extracted to microservices without major rewrites. Every decision is grounded in the Primus Demo Clinic battle-tested reference architecture.

---

## Frontend

| Layer | Choice | Version | Rationale |
|-------|--------|---------|-----------|
| Framework | React | 18.x | Team expertise, ecosystem maturity, same as Primus Demo Clinic |
| Build tool | Vite | 5.x | Fast HMR, native ESM, minimal config — replaced CRA |
| Language | TypeScript | 5.x | Type safety critical for healthcare data models |
| Styling | Tailwind CSS | 3.x | Utility-first, consistent with design tokens |
| Component primitives | shadcn/ui | Latest | Built on Radix UI, accessible by default, fully customizable |
| State management | Zustand | 4.x | Lightweight, no boilerplate, scales well |
| Server state | TanStack Query (React Query) | 5.x | Caching, background refresh, optimistic updates |
| Routing | React Router | 6.x | Same as Primus Demo Clinic reference |
| Form handling | React Hook Form + Zod | Latest | Performance, TypeScript integration, schema validation |
| Icons | lucide-react | Latest | Consistent, tree-shakeable, healthcare-appropriate |
| Charts | Recharts | Latest | React-native, composable, good accessibility support |
| Date handling | date-fns | 3.x | Lightweight, tree-shakeable, no Moment.js |
| HTTP client | Axios | Latest | Interceptors for auth headers + error handling |

**Two separate React apps:**
- `apps/provider-portal` — All clinical staff, admin, billing, super admin
- `apps/patient-portal` — Patient-facing portal (mobile-first)
- `apps/shared` — Shared component library (`@primus/ui`)

---

## Backend (Monolith-first)

| Layer | Choice | Version | Rationale |
|-------|--------|---------|-----------|
| Framework | Spring Boot | 3.x (Java 21) | Team expertise, virtual threads, same as Primus Demo Clinic |
| Language | Java | 21 (LTS) | Virtual threads (Project Loom), record classes, pattern matching |
| Architecture | Domain-Driven Design monolith | — | Package per domain; extractable to services later |
| ORM | Spring Data JPA + Hibernate | Latest | Same as Primus Demo Clinic |
| Validation | Bean Validation (Jakarta) | 3.x | Standard, declarative |
| Migrations | Liquibase | 4.x | Same as Primus Demo Clinic — SQL changesets |
| API | REST (JSON) | — | FHIR R4 APIs added in Phase 10 |
| API docs | Springdoc OpenAPI (Swagger) | 2.x | Auto-generated from annotations |
| Async | Spring Events + `@Async` → SQS | — | Internal events sync; cross-domain async via SQS |
| Scheduling | Spring `@Scheduled` + Quartz | — | Appointment reminders, eligibility checks |
| HL7 | HAPI FHIR / HAPI HL7v2 | Latest | Lab orders/results (OML/ORU), VaxCare (ADT/VXU) |

**DDD package structure:**
```
com.thinkitive.primus/
├── auth/                    → Authentication, Keycloak integration
├── tenant/                  → Tenant management, provisioning
├── patient/                 → Patient demographics, registration
├── scheduling/              → Appointments, calendars, rooms
├── encounter/               → Encounters, SOAP notes, documentation
├── order/                   → Lab orders, imaging, referrals
├── prescription/            → e-Prescribing, ScriptSure integration
├── billing/                 → Claims, RCM, Stripe, Availity
├── notification/            → SMS, email, in-app notifications
├── messaging/               → Secure patient-provider messaging
├── telehealth/              → Video session management
├── analytics/               → Reports, population health
├── integration/             → HL7, external API adapters
└── shared/                  → Cross-cutting: audit, security, base entities
```

Each domain package contains: `domain/`, `application/`, `infrastructure/`, `api/`

---

## Database

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Database engine | PostgreSQL 16 | ACID, JSON support, RLS for multi-tenancy |
| Dev/local | PostgreSQL 16 (Docker) | Same engine as prod, no surprises |
| Prod | AWS Aurora PostgreSQL 16 | Same as Primus Demo Clinic battle-tested |
| Migrations | Liquibase | Audited, version-controlled schema changes |
| Multi-tenancy | Shared DB + `tenant_id` column + RLS | From day one — no retrofit needed |
| Connection pool | HikariCP | Default Spring Boot, fast, reliable |

**Multi-tenancy strategy from day one:**
```sql
-- Every tenant-scoped table has tenant_id
CREATE TABLE patients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  mrn         VARCHAR(20) NOT NULL,
  -- ...
);

-- Row-Level Security enforced at DB layer
CREATE POLICY patient_tenant_isolation ON patients
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

---

## Authentication and Authorization

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Auth provider | Keycloak 24 | Same as Primus Demo Clinic, battle-tested |
| Deployment | ECS Fargate (prod) / Docker (local) | No managed Keycloak needed |
| Protocol | OpenID Connect + OAuth 2.0 | Standard, FHIR-compatible |
| Tenant isolation | Separate Keycloak realm per tenant | Hard isolation |
| Spring integration | Spring Security + `spring-boot-starter-oauth2-resource-server` | Standard |
| Roles | RBAC via Keycloak realm roles | Synced with app permission matrix |
| MFA | TOTP (Google Authenticator compatible) | Required for clinical staff |
| Session | JWT access tokens (15min) + refresh tokens (8h) | Standard for SPAs |

See `docs/architecture/auth-strategy.md` for full RBAC matrix.

---

## AWS Infrastructure

| Service | Usage | Rationale |
|---------|-------|-----------|
| ECS Fargate | Backend containers | Same as Primus Demo Clinic — no EC2 management |
| Aurora PostgreSQL 16 | Database | Serverless v2 dev, dedicated prod |
| S3 + CloudFront | Frontend hosting + static assets | Same as Primus Demo Clinic |
| SQS + DLQ | Async messaging between domains | Reliable, cheap, simple |
| Secrets Manager | DB passwords, API keys | Per-environment paths |
| Parameter Store | URLs, config, non-secret config | Cheaper than Secrets Manager for config |
| CloudFront | CDN for static assets only | API traffic goes direct to ALB |
| ALB | Load balancer + TLS termination | Single entry point |
| WAF v2 | OWASP rules + geo-restriction + rate limiting | Same as Primus Demo Clinic |
| CloudTrail | 7-year audit log (HIPAA) | Same as Primus Demo Clinic |
| Keycloak on ECS | Auth server | Self-hosted — Primus Demo Clinic proven |

**Cost target:** ~$150–200/month for dev/staging (single-server monolith mode)

### Monolith-first deployment

Until production with first real client:
```
Single ECS task (or single EC2 t3.medium) running the Spring Boot monolith
Single Aurora Serverless v2 instance
S3 + CloudFront for both frontends
SQS for async (appointment reminders, notifications)
Keycloak on same ECS cluster
Total: ~$150–200/month
```

---

## Observability

Same battle-tested stack as Primus Demo Clinic:

| Tool | Usage | Notes |
|------|-------|-------|
| Grafana | Dashboards, alerting | On ECS — same as Primus Demo Clinic |
| Loki | Log aggregation (backed by S3) | Much cheaper than CloudWatch Logs |
| Tempo | Distributed tracing | TraceId follows all requests |
| CloudWatch | Native AWS metrics, alarms, short-term container logs | 7-day log retention only |
| Sentry (self-hosted) | Exception tracking with full PHI stack traces | PHI-safe because self-hosted |

**Log format (mandatory on all log lines):**
```
[timestamp] [traceId] [spanId] [tenantId] [userId] [service] [method] [path] [status] [duration_ms]
```

---

## Integrations

| Integration | Purpose | Protocol | Phase |
|-------------|---------|----------|-------|
| ScriptSure | e-Prescribing + EPCS | HTTPS REST | 5 |
| Quest Diagnostics | Lab orders + results | HL7 v2 (OML/ORU) | 4 |
| Tribal Labs | Lab orders + results | HL7 v2 (ORM/ORU) | 4 |
| VaxCare | Immunization registry | HL7 v2 (ADT/SIU/VXU) | 4 |
| Availity | Claims clearinghouse | X12 EDI (837P/270/271/835) | 6 |
| Stripe | Payments | HTTPS REST + webhooks | 6 |
| Twilio | SMS + voice | HTTPS REST + webhooks | 8 |
| AWS SES | Email | AWS SDK | 8 |
| Firebase | Push notifications (mobile) | HTTPS REST | 8 |
| Jitsi (self-hosted) | Video (dev/local) | WebRTC | 7 |
| Amazon Chime SDK | Video (production) | WebRTC managed | 7 |
| Google Maps | Address autocomplete | HTTPS REST | 2 |
| Superset | Analytics dashboards | Self-hosted, embedded SDK | 9 |

See `docs/architecture/integration-strategy.md` for full integration details.

---

## Development Tools

| Tool | Usage |
|------|-------|
| Docker + Docker Compose | Local development stack |
| GitHub Actions | CI/CD pipeline |
| Terraform | IaC — same modular structure as Primus Demo Clinic |
| Liquibase | Database migrations |
| Checkstyle + SpotBugs | Java code quality |
| ESLint + Prettier | TypeScript code quality |
| Vitest + React Testing Library | Frontend testing |
| JUnit 5 + Mockito | Backend testing |
| Postman / Bruno | API testing collections |

**Local dev stack (`docker-compose.yml`):**
```yaml
services:
  postgres:     postgres:16
  keycloak:     quay.io/keycloak/keycloak:24.0
  jitsi:        jitsi/jitsi-meet (port 8443)
  redis:        redis:7 (session cache, future)
  mailhog:      mailhog (local email testing)
```
