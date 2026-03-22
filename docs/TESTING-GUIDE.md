# Primus EHR — Testing Guide

**Last updated:** 2026-03-22
**Test counts:** 70 frontend + 32 backend + 172 E2E = 274 total

---

## 1. Starting the Dev Stack

### Step 1: Start Docker infrastructure

```bash
cd /path/to/primus-ehr
docker compose up -d
```

Wait ~30 seconds for Keycloak to become healthy.

**Verify services are up:**
```bash
docker compose ps
# All 5 services should show "healthy" or "running"
```

**Service health checks:**
- PostgreSQL: `psql -h localhost -U primus -d primus -c "SELECT 1"`
- Keycloak: `curl http://localhost:8180/health/ready`
- Redis: `redis-cli ping` → PONG
- Mailhog: `http://localhost:8025`
- SonarQube: `http://localhost:9000`

### Step 2: Start the backend

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Wait for: `Started PrimusApplication in X.XXX seconds`

Verify: `curl http://localhost:8080/actuator/health` → `{"status":"UP"}`

**Swagger UI:** `http://localhost:8080/swagger-ui`

### Step 3: Start the provider portal

```bash
cd apps/provider-portal
npm run dev
# Starts on http://localhost:5173
```

### Step 4: Start the patient portal

```bash
cd apps/patient-portal
npm run dev
# Starts on http://localhost:5174
```

---

## 2. Login Credentials

All passwords: `password123`

### Provider Portal (localhost:5173)

| Email | Role | What to test |
|-------|------|-------------|
| `alex.morgan@thinkitive.com` | Super Admin | Tenant management, platform health, audit log |
| `james.wilson@primusdemo.com` | Tenant Admin | Org settings, users, locations, providers, payers |
| `maria.garcia@primusdemo.com` | Practice Admin | Ops dashboard, staff tasks, reports |
| `emily.chen@primusdemo.com` | Provider (MD) | Dashboard, patient chart, SOAP notes, orders, inbox |
| `sarah.thompson@primusdemo.com` | Nurse / MA | Room status, rooming checklist, vitals |
| `david.kim@primusdemo.com` | Front Desk | Schedule, check-in flow, patient registration |
| `lisa.patel@primusdemo.com` | Billing Staff | KPI dashboard, claims, denials, A/R, ERA |

### Patient Portal (localhost:5174)

| Email | Role | What to test |
|-------|------|-------------|
| `robert.johnson@email.com` | Patient | Home, appointments, messages, lab results, billing |

### Keycloak Admin Console

URL: `http://localhost:8180/admin` | Username: `admin` | Password: `admin`

---

## 3. Running Unit Tests

### Frontend tests (Vitest + React Testing Library)

```bash
# Run all frontend tests
cd apps/provider-portal
npm run test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

**Test files location:** `apps/provider-portal/src/__tests__/`

**Test files:**
- `authStore.test.ts` — Auth store: login, logout, role switching, JWT parsing
- `commandPalette.test.ts` — Command palette: search, navigation, keyboard shortcuts
- `apiClient.test.ts` — Axios client: interceptors, error handling, retry logic
- `queryHooks.test.ts` — TanStack Query hooks: all 25+ API hooks

**Expected output:** 70/70 tests pass

### Backend tests (JUnit 5 + Mockito)

```bash
cd backend
mvn test
```

**Test classes location:** `backend/src/test/java/`

**Test classes:**
- `PatientServiceTest` — Patient CRUD, search, chart aggregation
- `AppointmentServiceTest` — Scheduling, conflict detection, status updates
- `EncounterServiceTest` — SOAP note creation, signing, addendum
- `BillingServiceTest` — Claim creation, KPI calculation, ERA posting
- `GlobalExceptionHandlerTest` — Error response format validation

**Expected output:** BUILD SUCCESS, Tests run: 32, Failures: 0, Errors: 0

---

## 4. Running E2E Tests

### Setup (one-time)

```bash
cd apps/provider-portal
npx playwright install chromium firefox
```

### Run all E2E tests

```bash
# Requires: docker compose up + backend running + both portals running
npx playwright test
```

### Run specific spec files

```bash
# Auth flow
npx playwright test e2e/auth.spec.ts

# Navigation and role-based UI
npx playwright test e2e/navigation.spec.ts

# Patient chart happy path
npx playwright test e2e/patient-chart.spec.ts

# Patient portal flows
npx playwright test e2e/patient-portal.spec.ts
```

### Run in headed mode (see the browser)

```bash
npx playwright test --headed
```

### View the last test report

```bash
npx playwright show-report
```

**E2E spec files:** `apps/provider-portal/e2e/`
- `auth.spec.ts` — Login, logout, role switching, token refresh
- `navigation.spec.ts` — Sidebar nav, command palette (Ctrl+K), keyboard shortcuts
- `patient-chart.spec.ts` — Open chart, view problems/meds/vitals, start encounter, sign note, order lab
- `patient-portal.spec.ts` — Patient login, view appointments, send message, view lab results

**E2E happy-path flow (manual verification steps):**
1. Log in as Provider → Dashboard loads with today's schedule
2. Click patient from schedule → Chart opens with sticky header
3. Press Ctrl+K → Command palette opens, search works
4. Click New Encounter → SOAP editor opens
5. Type `.hyp` in Assessment → Smart phrase expands
6. Add ICD-10 diagnosis → Added to encounter
7. Click Orders → Lab → Add BMP → Order created
8. Click Sign → Encounter moves to SIGNED status
9. Log in as Billing → New charge appears in claim queue
10. Log in as Patient portal → Lab result visible after provider releases

---

## 5. Testing APIs via Swagger

**URL:** `http://localhost:8080/swagger-ui`

### Get a token first

1. In Swagger UI, find `POST /api/v1/auth/token` — or use curl:

```bash
TOKEN=$(curl -s -X POST http://localhost:8180/realms/primus/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=primus-frontend&username=emily.chen@primusdemo.com&password=password123" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
echo $TOKEN
```

2. In Swagger UI, click **Authorize** → paste `Bearer <token>` into the Authorization field.

3. Add `X-TENANT-ID: 5` to the global headers in Swagger UI (or include it in each curl request).

### Quick API smoke test (all domains)

```bash
# Set token and tenant
TOKEN=<your_token>
TENANT=5

# Patients
curl -s -H "Authorization: Bearer $TOKEN" -H "X-TENANT-ID: $TENANT" \
  http://localhost:8080/api/v1/patients | python3 -m json.tool | head -30

# Today's appointments
curl -s -H "Authorization: Bearer $TOKEN" -H "X-TENANT-ID: $TENANT" \
  http://localhost:8080/api/v1/appointments/today | python3 -m json.tool

# Dashboard KPIs
curl -s -H "Authorization: Bearer $TOKEN" -H "X-TENANT-ID: $TENANT" \
  http://localhost:8080/api/v1/dashboard/provider | python3 -m json.tool

# Billing KPIs
curl -s -H "Authorization: Bearer $TOKEN" -H "X-TENANT-ID: $TENANT" \
  http://localhost:8080/api/v1/billing/kpi | python3 -m json.tool

# Org settings
curl -s -H "Authorization: Bearer $TOKEN" -H "X-TENANT-ID: $TENANT" \
  http://localhost:8080/api/v1/settings/organization | python3 -m json.tool
```

---

## 6. Module-by-Module Test Checklist

### Provider Dashboard
- [ ] Login as Provider → dashboard loads with today's count
- [ ] Inbox badge shows unread count
- [ ] Appointment list shows today's schedule
- [ ] Pending tasks section populates

### Patient Chart
- [ ] Search for patient by name, DOB, MRN
- [ ] Chart opens with sticky header (name, DOB, allergies, risk flags)
- [ ] Problem list loads (ICD-10 codes visible)
- [ ] Medication list loads with dosage/frequency
- [ ] Allergy list loads with severity
- [ ] Vitals history loads with at least 3 entries
- [ ] Lab results section shows recent labs
- [ ] Timeline shows encounter history

### Encounter / SOAP Notes
- [ ] New Encounter opens SOAP editor
- [ ] Smart phrase `.hyp` expands in Assessment field
- [ ] ROS structured entry works
- [ ] Physical exam structured entry works
- [ ] Add ICD-10 diagnosis via code search
- [ ] Sign encounter → status changes to SIGNED
- [ ] Addendum can be added to signed note
- [ ] Cannot edit signed note body

### Scheduling
- [ ] Calendar loads today's appointments (color-coded by status)
- [ ] Create appointment → conflict check works (try double-booking same slot)
- [ ] Reschedule appointment → drag or use reschedule modal
- [ ] Cancel appointment with reason
- [ ] Filter by provider / location

### Lab Orders & Results
- [ ] Create lab order from within encounter
- [ ] Lab order appears in order history
- [ ] Lab result received → sign-off flow works
- [ ] Critical value flagging visible
- [ ] Trend data visible on numeric result

### Billing
- [ ] Signed encounter creates charge automatically
- [ ] Charge appears in billing claim queue
- [ ] Claim submission (stub) returns success
- [ ] Denial queue populated with test denials
- [ ] A/R aging shows buckets correctly
- [ ] Billing KPI dashboard shows real calculated values

### Messaging
- [ ] Send message to patient → appears in patient portal
- [ ] Reply from patient portal → appears in provider inbox
- [ ] WebSocket: send message, confirm real-time delivery (no page refresh)
- [ ] Unread count updates without page refresh

### Patient Portal (localhost:5174)
- [ ] Login as patient → dashboard loads
- [ ] Appointment list shows upcoming/past appointments
- [ ] Book new appointment → appears on provider schedule
- [ ] Send message to care team → visible in provider inbox
- [ ] Lab results visible (only released ones)
- [ ] Medication list visible
- [ ] Refill request → routes to provider inbox

### Settings (Tenant Admin)
- [ ] Organization profile loads and saves
- [ ] Add/edit location
- [ ] Add/edit provider (NPI, DEA, specialty)
- [ ] User management: create, activate, deactivate
- [ ] Fee schedule: view/edit CPT pricing

### Analytics
- [ ] Provider productivity dashboard loads
- [ ] Revenue KPI dashboard loads
- [ ] Care gaps panel populates for tenant panel
- [ ] Chronic disease panel filter works

---

## 7. SonarQube Code Quality

**URL:** `http://localhost:9000` | Login: `admin` / `admin`

### Run analysis

```bash
# Backend (from backend/ directory)
mvn sonar:sonar \
  -Dsonar.projectKey=primus-backend \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=<sonar_token>

# Frontend (from apps/provider-portal/)
npx sonarqube-scanner \
  -Dsonar.projectKey=primus-frontend \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=<sonar_token>
```

**Quality gate targets:**
- Coverage: > 70%
- Duplications: < 3%
- Code smells: < 50 (major)
- Security vulnerabilities: 0 (critical/blocker)

---

## 8. Known Limitations & Mock vs Real Data

### What is real (real DB, real queries):
- All patient data (10 seed patients from PostgreSQL)
- All appointments (10 seed appointments)
- All encounters, problems, medications, allergies (seeded)
- Auth/RBAC (real Keycloak JWT, real role checks)
- Dashboard counts (real SQL aggregations)
- Billing KPIs (real calculations from claim table)

### What is stubbed (returns mock/placeholder data):
- Quest Labs HL7 ingestion — returns seeded lab results, no real HL7 parsing
- Availity eligibility — returns `{ eligible: true, copay: 25 }` stub
- Stripe payments — records payment intent ID, no real charge
- Twilio SMS — sends to Mailhog (localhost:8025), not real SMS
- Amazon Chime SDK — video room URL stub, not a real Chime session
- ScriptSure EPCS — prescription saved to DB, no real e-prescribing network call
- PDMP query — returns empty result, no real state integration

### Frontend fallback behavior:
- All pages attempt the real API first (Axios + TanStack Query)
- On network error, pages show an error state (no silent fallback to mock data in production code paths)
- Development-only: `import.meta.env.VITE_USE_MOCK=true` flag enables mock data globally (not set by default)

---

## 9. Troubleshooting

### Backend won't start
- Check Docker services are up: `docker compose ps`
- Verify Keycloak is healthy before starting backend: `curl http://localhost:8180/health/ready`
- Check `backend/src/main/resources/application-dev.properties` for DB URL / Keycloak URL
- Check Liquibase changesets: look for checksum errors in backend logs — fix by running `mvn liquibase:clearCheckSums`

### 401 Unauthorized on API calls
- Token expired — re-fetch token (TTL: 3600 seconds)
- Wrong `client_id` in token request — must be `primus-frontend` (public client, no secret)
- Keycloak realm must be `primus` (not `master`)

### 403 Forbidden on API calls
- User doesn't have the required Keycloak role
- Check `@PreAuthorize` annotation on the controller method
- Verify the user in Keycloak Admin has the correct role mapping

### X-TENANT-ID mismatch (empty query results)
- The tenant ID in the seed data is `5` (auto-incremented on first run)
- Confirm with: `SELECT id FROM tenants LIMIT 1;`
- Frontend reads tenant_id from JWT claim — ensure Keycloak mapper is configured

### E2E tests failing
- Ensure all 4 services are running before playwright tests
- Check `playwright.config.ts` for baseURL (should be `http://localhost:5173`)
- Run `npx playwright install` if browser binaries are missing

### Port conflicts
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Reset the database (start fresh)
```bash
docker compose down -v  # removes volumes
docker compose up -d
# On next backend start, Liquibase will re-run all changesets
# Seed data: run backend/src/main/resources/db/seed/seed.sql manually
```
