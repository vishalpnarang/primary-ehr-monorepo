# API Reference — Primus EHR

## Status
- **Full API docs:** Pending (`docs/architecture/api-design.md` and `docs/architecture/api-contracts.md` not yet written)
- **Current phase:** Phase 0 (UI only — no real APIs, all mock data)
- **Source:** Inferred from integration strategy, multi-tenancy, and user flows

## API Architecture (Phase 1+)
- Spring Boot 3 REST (JSON)
- Springdoc OpenAPI (Swagger) auto-generated
- JWT validation via Spring Security OAuth2 Resource Server
- Tenant context from JWT `tenant_id` claim → PostgreSQL RLS
- Resilience4j circuit breakers on all external calls
- FHIR R4 APIs deferred to Phase 10

## Planned Endpoint Categories

| Category | Base Path | Auth | Phase |
|----------|-----------|------|-------|
| Platform (Super Admin) | `/api/platform/*` | SUPER_ADMIN only | 1 |
| Tenant provisioning | `/api/platform/tenants` | SUPER_ADMIN | 1 |
| Tenant settings | `/api/tenant/*` | TENANT_ADMIN | 1 |
| User management | `/api/users/*` | TENANT_ADMIN | 1 |
| Patients | `/api/patients/*` | Role-based | 2 |
| Scheduling | `/api/appointments/*` | Role-based | 2 |
| Encounters | `/api/encounters/*` | PROVIDER, NURSE_MA | 3 |
| Problems | `/api/patients/:id/problems` | PROVIDER, NURSE_MA | 3 |
| Medications | `/api/patients/:id/medications` | PROVIDER, NURSE_MA | 3 |
| Prescribing | `/api/prescriptions/*` | PROVIDER | 5 |
| Lab orders | `/api/orders/*` | PROVIDER | 4 |
| Lab results | `/api/results/*` | PROVIDER, NURSE_MA | 4 |
| Billing/Claims | `/api/billing/*` | BILLING | 6 |
| Messaging | `/api/messages/*` | Multiple roles | 3/8 |
| Notifications | `/api/notifications/*` | System | 8 |

## External Integration Endpoints

| Integration | Protocol | Endpoint Pattern |
|-------------|----------|------------------|
| ScriptSure | HTTPS REST | Outbound to ScriptSure API |
| Quest Labs | HL7 v2 over HTTPS | Outbound OML; inbound ORU webhook |
| VaxCare | HL7 v2 API | Outbound ADT/VXU |
| Availity | X12 EDI over REST | Outbound 837P/270; inbound 835/271 |
| Stripe | HTTPS REST + webhooks | Outbound API; inbound webhook events |
| Twilio | HTTPS REST + webhooks | Outbound SMS; inbound delivery status |

## Webhook Endpoints (inbound)

| Webhook | Source | Purpose |
|---------|--------|---------|
| `/webhooks/quest/results` | Quest Diagnostics | HL7 ORU lab results |
| `/webhooks/stripe` | Stripe | Payment events |
| `/webhooks/twilio` | Twilio | SMS delivery status |
| `/webhooks/availity/era` | Availity | 835 ERA files |

## Authentication Flow
1. Browser → Keycloak OIDC (Authorization Code + PKCE)
2. Keycloak returns JWT (RS256, 15-min access, 8h refresh)
3. Browser sends `Authorization: Bearer {jwt}` to API
4. Spring Security validates JWT, extracts `tenant_id`
5. `TenantJwtFilter` sets PostgreSQL session var → RLS enforced
6. `@PreAuthorize` checks role permissions

## Credential Storage
- AWS Secrets Manager: `primus/{env}/{tenant_id}/{integration}`
- IAM roles preferred over key pairs
- No hardcoded credentials anywhere
