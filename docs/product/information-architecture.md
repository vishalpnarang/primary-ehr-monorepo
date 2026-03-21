# Information Architecture — Primus EHR

Two separate React applications share a design system but serve different audiences.

---

## Provider Portal — Route Structure

Base URL: `https://app.primusehr.com`

### Global navigation (persistent left sidebar)

| Key | Label | Icon | Roles |
|-----|-------|------|-------|
| `Ctrl+1` | Dashboard | Home | All |
| `Ctrl+2` | Schedule | Calendar | All except Billing |
| `Ctrl+3` | Patients | Users | All |
| `Ctrl+4` | Inbox | Bell | Provider, Nurse, Practice Admin |
| `Ctrl+5` | Billing | DollarSign | Billing, Tenant Admin, Practice Admin |
| `Ctrl+6` | Reports | BarChart | Tenant Admin, Practice Admin, Billing |
| `Ctrl+7` | Settings | Gear | Tenant Admin, Super Admin |

---

### Route map

```
/ → redirect to /dashboard

/dashboard
  Role: Provider       → Today's schedule + priority inbox + care gaps
  Role: Nurse/MA       → Today's schedule + room status board + task queue
  Role: Front Desk     → Today's schedule + check-in queue + payment alerts
  Role: Billing        → Billing KPI dashboard + claim queue + denial queue
  Role: Practice Admin → Operational dashboard + staff tasks + metrics strip
  Role: Tenant Admin   → Org analytics + user activity + compliance alerts
  Role: Super Admin    → Platform metrics + tenant list + system health

/schedule
  /schedule                       → Day view (default: today)
  /schedule?view=week             → Week view
  /schedule?view=month            → Month view
  /schedule/new                   → New appointment modal (overlay)
  /schedule/:appointmentId        → Appointment detail drawer

/patients
  /patients                       → Patient search + recent patients list
  /patients/new                   → New patient registration
  /patients/:patientId            → Patient chart (default: summary tab)
  /patients/:patientId/summary    → Summary (S)
  /patients/:patientId/encounters → Encounter history (E)
  /patients/:patientId/medications → Medication list (M)
  /patients/:patientId/problems   → Problem list (P)
  /patients/:patientId/orders     → Orders (O)
  /patients/:patientId/vitals     → Vitals history (V)
  /patients/:patientId/labs       → Lab results (L)
  /patients/:patientId/immunizations → Immunizations (I)
  /patients/:patientId/referrals  → Referrals (R)
  /patients/:patientId/billing    → Patient billing history (B)
  /patients/:patientId/documents  → Documents / uploads
  /patients/:patientId/encounters/new → New encounter note
  /patients/:patientId/encounters/:encounterId → Encounter note view/edit

/inbox
  /inbox                          → Unified inbox (all types)
  /inbox?filter=labs              → Lab results to review
  /inbox?filter=messages          → Patient/team messages
  /inbox?filter=refills           → Refill requests
  /inbox?filter=pa                → Prior auth requests
  /inbox?filter=tasks             → Assigned tasks

/billing
  /billing                        → Billing dashboard (KPIs)
  /billing/charges                → Charge queue (ready to submit)
  /billing/claims                 → Claim management
  /billing/claims/:claimId        → Claim detail
  /billing/era                    → ERA / payment posting
  /billing/denials                → Denial queue
  /billing/denials/:denialId      → Denial detail + correction
  /billing/ar                     → A/R aging
  /billing/patients               → Patient balances

/reports
  /reports                        → Report list
  /reports/operational            → Operational metrics
  /reports/financial              → Financial performance
  /reports/clinical               → Clinical quality (HEDIS, MIPS)
  /reports/providers              → Provider productivity

/settings
  /settings                       → Settings home (role-dependent)
  
  Tenant Admin settings:
  /settings/organization          → Org profile (name, NPI, logo)
  /settings/locations             → Location management
  /settings/users                 → User management
  /settings/roles                 → Role configuration
  /settings/providers             → Provider profiles (DEA, NPI)
  /settings/payers                → Insurance and payer config
  /settings/fee-schedule          → CPT fee schedule
  /settings/integrations          → Quest, Surescripts, Availity credentials
  /settings/templates             → Org-wide note templates and smart phrases
  /settings/appointment-types     → Appointment type config

  Super Admin settings:
  /settings/tenants               → All tenants list
  /settings/tenants/new           → New tenant provisioning wizard
  /settings/tenants/:tenantId     → Tenant detail and config
  /settings/platform              → Platform health and metrics
  /settings/audit                 → Cross-tenant audit log
  /settings/feature-flags         → Feature flag management

/auth
  /login                          → Keycloak-hosted login page
  /logout                         → Clear session + redirect to login
  /auth/callback                  → OIDC callback handler
```

---

### Patient chart — detailed component hierarchy

The patient chart (`/patients/:patientId`) is the most complex screen in the provider portal. It uses a persistent two-panel layout:

```
┌─────────────────────────────────────────────────────────────────┐
│  PATIENT HEADER (sticky, 64px)                                  │
│  [Photo] [Name, DOB, Age] [MRN]  [Allergies] [Insurance] [Risk] │
│  [New Note N] [Prescribe R] [Order O] [Message G] [Schedule A]  │
├────────────────────┬────────────────────────────────────────────┤
│  LEFT NAV (320px)  │  CONTENT PANEL (flex-grow)                 │
│  ─────────────    │                                             │
│  [S] Summary      │  Content rendered based on selected         │
│  [E] Encounters   │  left nav item.                             │
│  [M] Medications  │                                             │
│  [P] Problems     │  Clicking any row/result expands            │
│  [O] Orders       │  IN-PLACE — never navigates to             │
│  [V] Vitals       │  new page.                                  │
│  [L] Labs         │                                             │
│  [I] Immunizations│                                             │
│  [R] Referrals    │                                             │
│  [B] Billing      │                                             │
│  [D] Documents    │                                             │
└────────────────────┴────────────────────────────────────────────┘
```

**Summary view content (default, everything visible above fold at 1080p):**
```
┌─────────────────────────────────────────────────────────────────┐
│  SUMMARY CARDS (4 always-expanded)                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌───────────┐ │
│  │ Active       │ │ Medications  │ │ Allergies│ │ Vitals    │ │
│  │ Problems (5) │ │ (8 active)   │ │ (2)      │ │ BP↑ HR✓   │ │
│  └──────────────┘ └──────────────┘ └──────────┘ └───────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  CARE GAPS (inline — not a separate tab)                        │
│  ⚠ A1c due (last: 14 months ago)  ⚠ Mammogram overdue           │
├─────────────────────────────────────────────────────────────────┤
│  CLINICAL TIMELINE (filterable: All | Visits | Labs | Orders)   │
│  03/18/26  Follow-up Visit — Dr. Chen                           │
│  03/10/26  Lab Result: HbA1c 7.8% (↑ from 7.2%)                │
│  02/15/26  Referral: Cardiology — Sent                          │
│  ...                                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

### Encounter note — single-screen layout

```
┌─────────────────────────────────────────────────────────────────┐
│ [← Back to Chart]  New Visit Note  Mar 18, 2026  Dr. Chen      │
│ Status: [DRAFT]  Auto-saved 2s ago                              │
├─────────────────────────────────────────────────────────────────┤
│ Chief Complaint                                                  │
│ [auto-pulled from intake: "Fatigue and increased thirst"]        │
├─────────────────────────────────────────────────────────────────┤
│ History of Present Illness                                       │
│ [rich text with .smartphrase expansion support]                  │
├─────────────────────────────────────────────────────────────────┤
│ Review of Systems                                                │
│ [structured checkboxes + free text per system]                  │
├─────────────────────────────────────────────────────────────────┤
│ Physical Examination                                             │
│ [configurable structured exam + free text]                      │
├─────────────────────────────────────────────────────────────────┤
│ Assessment & Plan                                                │
│  1. Type 2 Diabetes (E11.9)   [+ Add Problem]                   │
│     Plan: [text]  [Order Lab ⌘L]  [Prescribe ⌘R]  [Refer ⌘F]  │
├─────────────────────────────────────────────────────────────────┤
│ Billing                                                          │
│ E&M Level: [99214 ✓]  (auto-suggested from MDM)                 │
│ [Preview Claim]  [Sign & Close ↵]  [Save Draft]                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Command palette — structure

Triggered by `Ctrl+K` from anywhere in the provider portal:

```
┌────────────────────────────────────────────────┐
│  🔍 Search patients, actions, navigation...     │
├────────────────────────────────────────────────┤
│  RECENT                                        │
│  👤 Sarah Johnson — PAT-10042                  │
│  👤 Marcus Rivera — PAT-10089                  │
├────────────────────────────────────────────────┤
│  PATIENTS     (search results appear here)     │
│  ACTIONS      New Note N  |  Prescribe R  |    │
│               New Order O  |  Schedule A        │
│  NAVIGATION   Dashboard  |  Schedule  |  Inbox  │
└────────────────────────────────────────────────┘
```

---

### Dashboard layouts per role

**Provider dashboard:**
```
┌───────────────────┬─────────────────────────────┐
│ Today's Schedule  │ Priority Inbox               │
│                   │ 🔴 Critical: HbA1c STAT (2)  │
│ 08:30 Johnson S.  │ 🟡 PA Request: Humira (1)    │
│ 09:00 Rivera M.   │ 💬 Messages (4)              │
│ 09:30 [OPEN]      │ 🔵 Refill Requests (6)       │
│ 10:00 Chen L.     │ ℹ FYI Notifications (12)    │
├───────────────────┴─────────────────────────────┤
│ Care Gaps for Today's Patients                   │
│ Johnson: A1c overdue  |  Rivera: Mammogram due   │
└──────────────────────────────────────────────────┘
```

**Nurse/MA dashboard:**
```
┌───────────────────┬─────────────────────────────┐
│ Room Status Board │ My Task Queue               │
│                   │                             │
│ Room 1: EMPTY     │ ✓ Room Johnson (08:30)      │
│ Room 2: Chen L.   │ 📋 BP check — Rivera        │
│   [In Progress]   │ 💉 Flu shot — Thompson      │
│ Room 3: READY     │ 📞 Call re: lab — Chen      │
└───────────────────┴─────────────────────────────┘
```

**Front desk dashboard:**
```
┌───────────────────┬─────────────────────────────┐
│ Today's Schedule  │ Check-In Queue              │
│                   │                             │
│ ✅ Johnson 08:30  │ 🟡 Rivera M. — Arrived       │
│ 🔵 Rivera  09:00  │   Insurance: ⚠ Unverified   │
│ ⭕ Chen    09:30  │   Balance: $45 outstanding  │
│                   │   [Check In →]              │
└───────────────────┴─────────────────────────────┘
```

**Billing dashboard:**
```
┌────────────┬────────────┬───────────┬────────────┐
│ Clean Claim│ Denial Rate│ Days in AR│ Collections│
│   94.2%    │   5.8%     │  32 days  │  $48,200   │
│   ↑ 2.1%  │   ↓ 0.4%  │  ↑ 2 days │  this week │
├────────────┴────────────┴───────────┴────────────┤
│ Claim Queue (47 ready)    Denial Queue (12)       │
└──────────────────────────────────────────────────┘
```

---

## Patient Portal — Route Structure

Base URL: `https://my.primusehr.com`

### Navigation (top nav, mobile-first)

```
[Primus Logo]  [Home]  [Appointments]  [Messages]  [Records]  [Billing]
```

### Route map

```
/ → redirect to /home (if logged in) or /welcome (if not)

/welcome                    → Marketing landing + login/register CTA
/register                   → New patient registration (3 steps)
/login                      → Keycloak login
/auth/callback              → OIDC callback

/home                       → Patient dashboard
/appointments               → Upcoming and past appointments
/appointments/:id           → Appointment detail
/appointments/new           → Self-schedule (if enabled by clinic)
/appointments/:id/join      → Telehealth join page

/messages                   → Secure message threads list
/messages/:threadId         → Message thread with care team

/records                    → Health records overview
/records/visits             → Visit summaries list
/records/visits/:id         → Single visit summary
/records/labs               → Lab results list
/records/labs/:id           → Lab result detail (with provider note)
/records/medications        → Active medications
/records/immunizations      → Immunization history

/billing                    → Statements and balance
/billing/:statementId       → Statement detail
/billing/pay                → Payment flow (Stripe)

/profile                    → Demographics, contact info
/profile/insurance          → Insurance on file
/profile/notifications      → Notification preferences

/intake/:formToken          → Pre-visit intake form (tokenized link)
```

### Patient portal — home dashboard

```
┌─────────────────────────────────────────────────┐
│ Good morning, Sarah 👋                          │
│ Welcome to Primus Health                        │
├─────────────────────────────────────────────────┤
│ UPCOMING APPOINTMENT                            │
│ 📅 Tue, Mar 24 at 2:00 PM                       │
│ Dr. Emily Chen — Follow-up Visit                │
│ [Get Directions]  [Join Telehealth]  [Cancel]   │
├──────────────────┬──────────────────────────────┤
│ NEW RESULTS      │ MESSAGES                     │
│ 🔴 Lab result    │ 💬 Dr. Chen (Mar 18)         │
│ ready to view    │ "Your A1c results are in..." │
│ [View Results]   │ [View Message]               │
├──────────────────┴──────────────────────────────┤
│ OUTSTANDING BALANCE: $45.00                     │
│ [Pay Now]                                       │
└─────────────────────────────────────────────────┘
```

---

## Shared UX Patterns (both portals)

| Pattern | Trigger | Behavior |
|---------|---------|----------|
| Command palette | `Ctrl+K` | Provider portal only; fuzzy search across patients/actions/nav |
| Keyboard nav | All interactive elements | Tab, Shift+Tab, Enter, Escape, Arrow keys |
| Toast notifications | System events | Bottom-right, 4s timeout, stacked max 3 |
| Skeleton loading | Any async data | Shown immediately while data loads |
| Empty states | Empty lists | Illustration + descriptive text + primary action |
| Error states | API failure | Inline error + retry button; never blank screen |
| Confirmation dialogs | Destructive actions | "Are you sure?" — Escape cancels, Enter confirms |
| Inline expansion | Click a list item | Expands in-place with slide-down animation |
| Slide-over panel | Rx, orders, messages | Right-side panel that doesn't navigate away |
| Sticky header | Patient chart | Always visible — name, allergies, actions |
