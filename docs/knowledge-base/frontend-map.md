# Frontend Map — Primus EHR

## Applications

| App | Path | Target | Layout |
|-----|------|--------|--------|
| Provider Portal | `apps/provider-portal` | Desktop-first (1280x720 min) | Sidebar (64px collapsed / 240px expanded) + content |
| Patient Portal | `apps/patient-portal` | Mobile-first (375px min) | Top nav + single/two column |
| Shared UI | `apps/shared` | `@primus/ui` package | Component library |

## Provider Portal Routes

| Route | Role(s) | Description |
|-------|---------|-------------|
| `/dashboard` | All (role-aware) | Provider: schedule+inbox+care gaps; Nurse: rooms+tasks; FrontDesk: check-in queue; Billing: KPIs |
| `/schedule` | All except Billing | Day/week/month calendar, drag-drop, multi-provider |
| `/patients` | All | Search + recent patients list |
| `/patients/:id` | Clinical roles | Patient chart — 11 tabs (S/E/M/P/O/V/L/I/R/B/D) |
| `/patients/:id/encounters/new` | Provider | SOAP note editor with smart phrases |
| `/inbox` | Provider, Nurse, Practice Admin | Priority inbox (labs, PA, messages, refills, tasks) |
| `/billing/*` | Billing, Tenant Admin | Charges, claims, ERA, denials, A/R aging |
| `/reports/*` | Admin roles, Billing | Operational, financial, clinical, provider reports |
| `/settings/*` | Tenant Admin, Super Admin | Org profile, users, roles, locations, integrations, templates |

## Patient Portal Routes

| Route | Description |
|-------|-------------|
| `/home` | Dashboard: upcoming appointment, new results, messages, balance |
| `/appointments` | View/book/cancel appointments |
| `/messages` | Secure messaging with care team |
| `/records/*` | Visits, labs, medications, immunizations |
| `/billing` | Statements + Stripe payment |
| `/profile` | Demographics, insurance, notification preferences |
| `/intake/:token` | Pre-visit intake form (tokenized link) |

## Component Library (`@primus/ui`)

### Layout (4)
- `AppShell` — Root layout (sidebar + content)
- `Sidebar` — Left nav with role-filtered items, badges, keyboard shortcuts
- `PageHeader` — Title + breadcrumbs + actions
- `SplitPanel` — Two-column (320px fixed left + flex right)
- `SlideOver` — Right drawer for Rx/orders/messages (400/560/720px)

### Navigation (2)
- `CommandPalette` — `Ctrl+K` global search (patients, actions, nav)
- `TabNav` — Horizontal tabs for chart sections

### Data Display (7)
- `DataTable` — Sortable, filterable, selectable table with skeleton/empty states
- `StatCard` — KPI metric card with trend indicator
- `Timeline` — Clinical event timeline (filterable)
- `Sparkline` — Mini trend chart for vitals/labs
- `VitalSigns` — Current vitals display with trends
- `LabResult` — Single result with reference range and abnormal flagging
- `PatientHeader` — Sticky header (name, DOB, MRN, allergies, risk flags, actions)

### Forms (6)
- `Input` — Text input with label, error, monospace option
- `Select` — Searchable dropdown
- `DatePicker` — Calendar with keyboard nav
- `SmartPhraseInput` — Rich text with `.xxx` expansion
- `RosChecklist` — Review of Systems structured entry
- `VitalsForm` — Vitals entry with auto-BMI and out-of-range alerts

### Feedback (6)
- `Alert` — Inline banner (critical/warning/info/success)
- `Toast` — Bottom-right notification (max 3 stacked, 4s timeout)
- `Modal` — Accessible dialog with focus trap
- `CriticalAlert` — Tier-1 interruptive (requires explicit acknowledgment)
- `Skeleton` — Loading placeholder (text/card/table/avatar variants)
- `EmptyState` — Empty list state with action prompt

### Clinical Badges (3)
- `AllergyBadge` — Red pill with severity
- `RiskBadge` — Patient risk flag indicator
- `StatusBadge` — General status indicator with color dot

## Keyboard Shortcuts

| Tier | Scope | Examples |
|------|-------|---------|
| Tier 1 — Global | Always active | `Ctrl+K` palette, `Ctrl+N` new note, `Ctrl+Enter` sign, `Ctrl+1-7` nav |
| Tier 2 — Chart | Patient chart (not in text input) | `S` summary, `E` encounters, `M` meds, `P` problems, `N` new note |
| Tier 3 — Form | Inside form context | `.` smart phrase, `Tab/Shift+Tab` fields, `↑↓` dropdown nav |

## State Management

| Store | Library | Data |
|-------|---------|------|
| Auth context | Zustand | Current user, role, tenant, permissions |
| Patient context | Zustand | Active patient(s), open chart tabs (max 5) |
| UI state | Zustand | Sidebar collapsed, theme, font size |
| Server data | TanStack Query | All API data (mock in Phase 0) |

## Mock Data Conventions
- Patient IDs: `PAT-XXXXX`, Provider: `PRV-XXXXX`, Appointment: `APT-XXXXX`
- Encounter: `ENC-XXXXX`, Tenant: `TEN-XXXXX`
- Dates: ISO 8601
- Mock data location: `apps/[portal]/src/mocks/`
- Realistic US healthcare data (names, diagnoses, ICD-10, CPT, medications)
