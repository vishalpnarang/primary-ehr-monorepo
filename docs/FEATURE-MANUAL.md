# Primus EHR — Feature Manual

**Last updated:** 2026-03-22
**Backend version:** Phases 1–10 complete
**Base URL:** `http://localhost:8080/api/v1`
**API docs (live):** `http://localhost:8080/swagger-ui`

---

## Authentication

All API requests require a Bearer token from Keycloak and an `X-TENANT-ID` header.

### Obtain JWT Token

```
POST http://localhost:8180/realms/primus/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=password
client_id=primus-frontend
username=emily.chen@primusdemo.com
password=password123
```

Response: `{ "access_token": "eyJ...", "expires_in": 3600, "token_type": "Bearer" }`

### Required Headers on Every Request

| Header | Value | Notes |
|--------|-------|-------|
| `Authorization` | `Bearer <access_token>` | JWT from Keycloak |
| `X-TENANT-ID` | `5` (dev seed) or tenant DB ID | Extracted from JWT `tenant_id` claim in production |
| `Content-Type` | `application/json` | For POST/PUT/PATCH bodies |

### Tenant ID in JWT

The `TenantContextFilter` reads `tenant_id` from the JWT token claims (set by the Keycloak mapper). The frontend extracts this via `authStore` and sends it as both the `X-TENANT-ID` header and a context variable.

---

## Domain 1: Patients

Base path: `/api/v1/patients`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/patients` | List patients. Params: `?search=`, `?status=active`, `?page=0`, `?size=20` |
| POST | `/patients` | Create new patient |
| GET | `/patients/{id}` | Get patient by ID |
| PUT | `/patients/{id}` | Update patient demographics |
| DELETE | `/patients/{id}` | Soft-delete (archive) patient |
| GET | `/patients/{id}/chart` | Aggregated chart: demographics + problems + meds + allergies + vitals + encounters |
| GET | `/patients/{id}/timeline` | Clinical timeline filtered by type and date range |
| GET | `/patients/{id}/risk-flags` | Active risk flags |

**Create patient request body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "1980-05-14",
  "gender": "FEMALE",
  "email": "jane.smith@email.com",
  "phone": "555-234-5678",
  "address": { "street": "123 Main St", "city": "Columbus", "state": "OH", "zip": "43215" },
  "insurancePrimary": { "payerId": "BCBS-OH", "memberId": "XYZ123456", "groupId": "GRP-001" },
  "emergencyContact": { "name": "John Smith", "relationship": "Spouse", "phone": "555-345-6789" }
}
```

**Patient ID format:** `PAT-XXXXX`

---

## Domain 2: Scheduling & Appointments

Base path: `/api/v1/appointments`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/appointments` | List appointments. Params: `?date=`, `?providerId=`, `?locationId=`, `?status=` |
| POST | `/appointments` | Create appointment (conflict check included) |
| GET | `/appointments/{id}` | Get appointment detail |
| PATCH | `/appointments/{id}` | Update appointment (status, time, room) |
| DELETE | `/appointments/{id}` | Cancel appointment |
| GET | `/appointments/today` | Today's appointments for the requesting provider |
| PATCH | `/appointments/{id}/reschedule` | Reschedule with new date/time |
| PATCH | `/appointments/{id}/cancel` | Cancel with reason |
| GET | `/appointments/availability` | Provider availability slots. Params: `?providerId=`, `?date=`, `?duration=` |
| GET | `/appointments/types` | Appointment types with duration config |
| POST | `/appointments/types` | Create appointment type |

**Create appointment request body:**
```json
{
  "patientId": "PAT-00001",
  "providerId": "PRV-00001",
  "locationId": 1,
  "roomId": 3,
  "appointmentTypeId": 2,
  "scheduledAt": "2026-03-25T14:00:00Z",
  "notes": "Follow-up for hypertension management"
}
```

**Appointment status values:** `SCHEDULED`, `ARRIVED`, `IN_ROOM`, `SEEN`, `DISCHARGED`, `NO_SHOW`, `CANCELLED`

**Appointment ID format:** `APT-XXXXX`

---

## Domain 3: Encounters & SOAP Notes

Base path: `/api/v1/encounters`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/encounters` | List encounters. Params: `?patientId=`, `?providerId=`, `?status=` |
| POST | `/encounters` | Create encounter (opens SOAP note) |
| GET | `/encounters/{id}` | Get encounter with full SOAP content |
| PUT | `/encounters/{id}` | Update encounter SOAP fields (auto-saves) |
| POST | `/encounters/{id}/sign` | Sign and lock encounter |
| POST | `/encounters/{id}/addendum` | Add addendum to signed encounter |
| GET | `/encounters/{id}/history` | Audit history via Envers |

**Create encounter request body:**
```json
{
  "patientId": "PAT-00001",
  "providerId": "PRV-00001",
  "appointmentId": "APT-00001",
  "visitType": "OFFICE_VISIT_ESTABLISHED",
  "scheduledAt": "2026-03-25T14:00:00Z"
}
```

**Update encounter (SOAP) request body:**
```json
{
  "chiefComplaint": "Headache for 3 days",
  "hpi": "Patient presents with...",
  "ros": { "constitutional": "No fever", "cardiovascular": "No chest pain" },
  "physicalExam": { "general": "Alert and oriented", "cardiovascular": "Regular rate and rhythm" },
  "assessment": "Tension headache, Essential hypertension",
  "plan": "Start lisinopril 10mg daily. Follow up in 4 weeks.",
  "diagnoses": [{ "code": "G44.2", "description": "Tension-type headache" }, { "code": "I10", "description": "Essential hypertension" }],
  "emCode": "99213",
  "timeSpentMinutes": 25
}
```

**Encounter status:** `DRAFT`, `IN_PROGRESS`, `SIGNED`, `ADDENDED`

**Encounter ID format:** `ENC-XXXXX`

---

## Domain 4: Problem List

Base path: `/api/v1/patients/{patientId}/problems`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/problems` | List patient problems |
| POST | `/problems` | Add problem to problem list |
| PUT | `/problems/{id}` | Update problem (onset, notes) |
| PATCH | `/problems/{id}/resolve` | Mark problem resolved |
| DELETE | `/problems/{id}` | Remove problem |

**Add problem request body:**
```json
{
  "icd10Code": "I10",
  "description": "Essential hypertension",
  "onsetDate": "2020-01-15",
  "status": "ACTIVE",
  "notes": "Well-controlled on lisinopril"
}
```

---

## Domain 5: Medications

Base path: `/api/v1/patients/{patientId}/medications`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/medications` | List medications. Params: `?status=active` |
| POST | `/medications` | Add medication |
| PUT | `/medications/{id}` | Update medication |
| PATCH | `/medications/{id}/discontinue` | Discontinue medication |

**Add medication request body:**
```json
{
  "name": "Lisinopril",
  "dosage": "10mg",
  "frequency": "Once daily",
  "route": "Oral",
  "prescriberId": "PRV-00001",
  "startDate": "2026-01-15",
  "indication": "Hypertension",
  "status": "ACTIVE"
}
```

---

## Domain 6: Allergies

Base path: `/api/v1/patients/{patientId}/allergies`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/allergies` | List allergies |
| POST | `/allergies` | Add allergy |
| PUT | `/allergies/{id}` | Update allergy |
| DELETE | `/allergies/{id}` | Remove allergy |

**Add allergy request body:**
```json
{
  "allergen": "Penicillin",
  "allergenType": "DRUG",
  "reaction": "Hives, anaphylaxis",
  "severity": "SEVERE",
  "onsetDate": "2015-03-10"
}
```

**Severity values:** `MILD`, `MODERATE`, `SEVERE`, `LIFE_THREATENING`

---

## Domain 7: Vitals

Base path: `/api/v1/patients/{patientId}/vitals`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/vitals` | List vitals history. Params: `?limit=20` |
| POST | `/vitals` | Record new vitals set |
| GET | `/vitals/trends` | Time-series trend data for sparkline |

**Record vitals request body:**
```json
{
  "encounterId": "ENC-00001",
  "bloodPressureSystolic": 128,
  "bloodPressureDiastolic": 82,
  "heartRate": 74,
  "temperature": 98.6,
  "oxygenSaturation": 98,
  "weight": 165.0,
  "height": 68.0,
  "bmi": 25.1,
  "painScore": 2,
  "recordedAt": "2026-03-25T14:10:00Z"
}
```

---

## Domain 8: Orders (Labs, Imaging, Referrals)

Base path: `/api/v1/orders`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/orders` | List orders. Params: `?patientId=`, `?type=LAB`, `?status=` |
| POST | `/orders/labs` | Create lab order |
| POST | `/orders/imaging` | Create imaging order |
| POST | `/orders/referrals` | Create referral |
| GET | `/orders/{id}` | Get order detail |
| PATCH | `/orders/{id}/status` | Update order status |
| GET | `/orders/favorites` | Provider's favorite order sets |
| POST | `/orders/favorites` | Save order as favorite |

**Create lab order request body:**
```json
{
  "patientId": "PAT-00001",
  "encounterId": "ENC-00001",
  "labTests": [
    { "code": "CBC", "description": "Complete Blood Count" },
    { "code": "BMP", "description": "Basic Metabolic Panel" }
  ],
  "priority": "ROUTINE",
  "lab": "QUEST",
  "clinicalIndication": "Hypertension monitoring",
  "icd10Codes": ["I10"]
}
```

---

## Domain 9: Lab Results

Base path: `/api/v1/lab-results`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/lab-results` | List results. Params: `?patientId=`, `?released=true` |
| GET | `/lab-results/{id}` | Get result detail with reference ranges |
| POST | `/lab-results/{id}/sign` | Sign/acknowledge result |
| GET | `/lab-results/{id}/trends` | Trend data points for a specific test |
| POST | `/lab-results/{id}/release` | Release result to patient portal |

**Lab result response includes:**
- `testName`, `value`, `unit`, `referenceRangeLow`, `referenceRangeHigh`
- `flag`: `NORMAL`, `LOW`, `HIGH`, `CRITICAL_LOW`, `CRITICAL_HIGH`
- `resultDate`, `signedAt`, `signedBy`, `releasedToPortal`

---

## Domain 10: Prescriptions & Formulary

Base path: `/api/v1/prescriptions`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/prescriptions` | List prescriptions. Params: `?patientId=`, `?status=` |
| POST | `/prescriptions` | Create prescription |
| GET | `/prescriptions/{id}` | Get prescription detail |
| POST | `/prescriptions/{id}/refill` | Request refill |
| PATCH | `/prescriptions/{id}/cancel` | Cancel prescription |

**Formulary:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/formulary/drugs` | Search drug catalog. Params: `?q=lisinopril` |
| GET | `/formulary/drugs/{id}/interactions` | Drug-drug interaction check |
| GET | `/formulary/drugs/{id}/coverage` | Coverage tier for patient's plan |
| GET | `/formulary/check-allergy` | Cross-check drug against patient allergies |

**Create prescription request body:**
```json
{
  "patientId": "PAT-00001",
  "encounterId": "ENC-00001",
  "drugName": "Lisinopril",
  "drugCode": "NDC-68462-0272-01",
  "strength": "10mg",
  "dosageForm": "Tablet",
  "sig": "Take 1 tablet by mouth once daily",
  "dispense": 30,
  "refills": 3,
  "daysSupply": 30,
  "pharmacyId": "PHARM-00001",
  "controlled": false,
  "icd10Codes": ["I10"]
}
```

---

## Domain 11: Billing & Revenue Cycle

Base path: `/api/v1/billing`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/billing/kpi` | KPI dashboard: clean claim rate, denial rate, days in A/R |
| GET | `/billing/claims` | List claims. Params: `?status=`, `?payerId=` |
| POST | `/billing/claims` | Create/submit claim from encounter |
| GET | `/billing/claims/{id}` | Get claim detail |
| PATCH | `/billing/claims/{id}/resubmit` | Resubmit corrected claim |
| GET | `/billing/denials` | Denial queue sorted by dollar amount + age |
| POST | `/billing/denials/{id}/work` | Record denial work action |
| GET | `/billing/ar-aging` | A/R aging: 0-30, 31-60, 61-90, 91-120, 120+ buckets |
| POST | `/billing/era` | Post ERA (835 file) |
| GET | `/billing/eligibility/{patientId}` | Real-time eligibility check |

**Create claim request body:**
```json
{
  "encounterId": "ENC-00001",
  "diagnoses": ["I10", "Z00.00"],
  "procedures": [
    { "code": "99213", "modifier": null, "units": 1, "charge": 150.00 }
  ],
  "renderingProviderId": "PRV-00001",
  "payerId": "BCBS-OH",
  "clearinghouse": "AVAILITY"
}
```

---

## Domain 12: Invoices & Payments

Base path: `/api/v1/invoices`, `/api/v1/payments`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/invoices` | List patient invoices. Params: `?patientId=`, `?status=` |
| POST | `/invoices` | Create invoice |
| GET | `/invoices/{id}` | Get invoice detail |
| GET | `/payments` | List payments. Params: `?patientId=` |
| POST | `/payments` | Record patient payment (Stripe intent ID) |
| POST | `/payments/plans` | Create payment plan |
| GET | `/payments/plans/{id}` | Get payment plan installments |

---

## Domain 13: Inventory

Base path: `/api/v1/inventory`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/inventory/items` | List inventory items. Params: `?locationId=`, `?lowStock=true` |
| POST | `/inventory/items` | Add inventory item |
| PUT | `/inventory/items/{id}` | Update item details |
| POST | `/inventory/items/{id}/usage` | Record usage event |
| GET | `/inventory/alerts` | Low-stock alerts |

---

## Domain 14: Messaging

Base path: `/api/v1/messages`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/messages/inbox` | Provider inbox. Params: `?type=`, `?unread=true` |
| GET | `/messages/threads` | Message threads |
| POST | `/messages/threads` | Start new message thread |
| GET | `/messages/threads/{id}` | Get thread with all messages |
| POST | `/messages/threads/{id}/reply` | Reply in thread |
| PATCH | `/messages/{id}/read` | Mark message as read |
| PATCH | `/messages/{id}/assign` | Assign message to user |
| GET | `/messages/unread-count` | Unread message count for bell badge |

**WebSocket endpoint:** `ws://localhost:8080/ws` (STOMP over SockJS)
- Subscribe: `/user/queue/messages` for incoming messages
- Subscribe: `/topic/threads/{threadId}` for thread updates
- Send: `/app/message.send`

---

## Domain 15: Notifications

Base path: `/api/v1/notifications`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/notifications` | List notifications for current user |
| GET | `/notifications/unread-count` | Unread count for bell badge |
| PATCH | `/notifications/{id}/read` | Mark notification as read |
| PATCH | `/notifications/read-all` | Mark all read |
| GET | `/notifications/preferences` | Get user notification preferences |
| PUT | `/notifications/preferences` | Update preferences (SMS/email/in-app per event type) |

**Notification event types:** `APPOINTMENT_REMINDER`, `LAB_RESULT_READY`, `SECURE_MESSAGE`, `REFILL_REQUEST`, `CRITICAL_VALUE`, `TASK_ASSIGNED`

---

## Domain 16: Analytics

Base path: `/api/v1/analytics`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/analytics/dashboard` | Provider productivity: encounters/day, avg visit duration |
| GET | `/analytics/revenue` | Revenue KPIs: collections, denial rate, net revenue |
| GET | `/analytics/care-gaps` | HEDIS care gap summary for tenant panel |
| GET | `/analytics/patients/chronic` | Chronic disease panel. Params: `?condition=diabetes` |
| GET | `/analytics/quality-measures` | MIPS/MACRA quality measure scores |
| GET | `/analytics/provider/{id}` | Per-provider stats |

---

## Domain 17: CRM & Outreach

Base path: `/api/v1/crm`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/crm/patients` | CRM patient list with engagement scores |
| GET | `/crm/campaigns` | Outreach campaigns |
| POST | `/crm/campaigns` | Create campaign with target patient list |
| GET | `/crm/campaigns/{id}` | Campaign detail + engagement metrics |
| POST | `/crm/campaigns/{id}/send` | Execute campaign (triggers notifications) |

---

## Domain 18: Employer Health

Base path: `/api/v1/employers`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/employers` | List employer accounts |
| POST | `/employers` | Create employer account |
| GET | `/employers/{id}` | Employer detail |
| GET | `/employers/{id}/employees` | Employee panel |
| GET | `/employers/{id}/analytics` | Aggregate health analytics for employer |

---

## Domain 19: Affiliates & Brokers

Base path: `/api/v1/affiliates`, `/api/v1/brokers`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/affiliates` | List affiliates |
| POST | `/affiliates` | Create affiliate |
| GET | `/affiliates/{id}/referrals` | Referrals from affiliate |
| GET | `/brokers` | List brokers |
| POST | `/brokers` | Create broker |
| GET | `/brokers/{id}/commissions` | Commission tracking |

---

## Domain 20: RBAC & Settings

Base path: `/api/v1/settings`, `/api/v1/users`, `/api/v1/roles`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/settings/organization` | Tenant org profile (name, NPI, address) |
| PUT | `/settings/organization` | Update org profile |
| GET | `/settings/locations` | List clinic locations |
| POST | `/settings/locations` | Add location |
| GET | `/settings/providers` | List providers (with DEA, NPI, specialty) |
| POST | `/settings/providers` | Add provider |
| GET | `/users` | List users for tenant |
| POST | `/users` | Create user (also creates Keycloak account) |
| PATCH | `/users/{id}/activate` | Activate user |
| PATCH | `/users/{id}/deactivate` | Deactivate user |
| GET | `/roles` | List roles and permissions |

---

## Domain 21: Templates & Smart Phrases

Base path: `/api/v1/templates`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/templates` | List templates. Params: `?type=SOAP`, `?visitType=` |
| POST | `/templates` | Create template |
| GET | `/templates/{id}` | Get template content |
| PUT | `/templates/{id}` | Update template |
| DELETE | `/templates/{id}` | Delete template |
| GET | `/templates/phrases` | List dot-phrases. Params: `?prefix=.hyp` |
| POST | `/templates/phrases` | Create dot-phrase |
| GET | `/templates/phrases/expand` | Expand dot-phrase. Params: `?phrase=.hyp` |

---

## Domain 22: FormBuilder

Base path: `/api/v1/forms`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/forms` | List form definitions. Params: `?type=INTAKE` |
| POST | `/forms` | Create form definition with field schema |
| GET | `/forms/{id}` | Get form with field definitions |
| POST | `/forms/{id}/submit` | Submit completed form |
| GET | `/forms/submissions/{id}` | Get form submission |
| POST | `/forms/submissions/{id}/populate-chart` | Push submission data to patient chart |

---

## Domain 23: Care Plans

Base path: `/api/v1/care-plans`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/care-plans` | List care plans. Params: `?patientId=` |
| POST | `/care-plans` | Create care plan |
| GET | `/care-plans/{id}` | Get plan with goals and interventions |
| PUT | `/care-plans/{id}` | Update plan |
| POST | `/care-plans/{id}/goals` | Add goal |
| PATCH | `/care-plans/{id}/goals/{goalId}` | Update goal status |

---

## Domain 24: Dashboard

Base path: `/api/v1/dashboard`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/provider` | Provider dashboard: today's schedule, inbox counts, pending tasks |
| GET | `/dashboard/nurse` | Nurse/MA dashboard: room status, rooming queue |
| GET | `/dashboard/frontdesk` | Front desk: check-in queue, schedule summary |
| GET | `/dashboard/billing` | Billing KPIs, claims pending, denial rate |
| GET | `/dashboard/admin` | Admin: user activity, system health |

---

## Error Response Format

All errors return:
```json
{
  "timestamp": "2026-03-22T14:00:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Patient PAT-99999 not found",
  "path": "/api/v1/patients/PAT-99999",
  "tenantId": 5
}
```

**HTTP status codes:**
- `200` — Success
- `201` — Created
- `204` — No content (DELETE, PATCH success)
- `400` — Validation error (body contains field-level errors)
- `401` — Missing or expired JWT
- `403` — Insufficient role/permission
- `404` — Resource not found
- `409` — Conflict (e.g., appointment time already booked)
- `500` — Internal server error

---

## Docker Compose Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| postgres | postgres:16 | 5432 | Primary database |
| keycloak | quay.io/keycloak/keycloak:24 | 8180 | Identity provider |
| redis | redis:7 | 6379 | Session cache |
| mailhog | mailhog/mailhog | 8025 (UI), 1025 (SMTP) | Email testing |
| sonarqube | sonarqube:community | 9000 | Code quality |

**Start all services:**
```bash
docker compose up -d
```

**Default credentials:**
- PostgreSQL: `primus` / `primus` / db `primus`
- Keycloak admin: `admin` / `admin` at `http://localhost:8180/admin`
- SonarQube: `admin` / `admin` at `http://localhost:9000`
- Mailhog UI: `http://localhost:8025` (no auth)
