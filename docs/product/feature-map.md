# Feature Map — Primus EHR

**Priority definitions:**
- **P0 — Must have at launch.** Product cannot go live without this. Patient safety or legal compliance depends on it.
- **P1 — Should have at launch.** Strong differentiator. Significantly impacts user adoption. Ship in Phase 1–3.
- **P2 — Nice to have.** Future roadmap. Important but not blocking adoption.

---

## Module 1: Super Admin (Platform Management)

| # | Feature | Priority | Phase | Notes |
|---|---------|----------|-------|-------|
| 1.1 | Tenant list with health status | P0 | 1 | Active/inactive, last login, error count |
| 1.2 | New tenant provisioning wizard | P0 | 1 | Creates Keycloak realm + DB schema + default config |
| 1.3 | Tenant configuration (features, integrations) | P0 | 1 | Per-tenant feature flags |
| 1.4 | Global platform metrics dashboard | P0 | 1 | Uptime, API errors, queue depth |
| 1.5 | User impersonation (with audit log) | P0 | 1 | Support escalation tool |
| 1.6 | Audit log viewer (cross-tenant) | P0 | 1 | HIPAA requirement |
| 1.7 | Keycloak realm management UI | P1 | 2 | Currently via Keycloak admin console |
| 1.8 | Feature flag management | P1 | 2 | Enable/disable features per tenant |
| 1.9 | Platform announcement/maintenance mode | P1 | 2 | Banner for planned downtime |
| 1.10 | Billing/subscription management per tenant | P2 | 10 | SaaS billing for Primus itself |

---

## Module 2: Tenant Admin (Clinic Setup)

| # | Feature | Priority | Phase | Notes |
|---|---------|----------|-------|-------|
| 2.1 | Organization profile (name, NPI, address, logo) | P0 | 1 | Required for claims |
| 2.2 | Location management (multiple clinic sites) | P0 | 1 | Each location has own hours, rooms |
| 2.3 | User management (invite, activate, deactivate) | P0 | 1 | Role assignment |
| 2.4 | Role and permission configuration | P0 | 1 | Which roles see which modules |
| 2.5 | Provider setup (DEA, NPI, specialty, license) | P0 | 1 | Required for e-prescribing and claims |
| 2.6 | Insurance and payer configuration | P0 | 6 | Payer IDs, contract rates |
| 2.7 | Fee schedule management | P0 | 6 | CPT code pricing |
| 2.8 | Integration credentials management | P0 | 4 | Quest, Surescripts, Availity API keys |
| 2.9 | Revenue analytics dashboard | P1 | 6 | Collections, denial rate, days in AR |
| 2.10 | Provider performance metrics | P1 | 9 | Encounters per day, coding patterns |
| 2.11 | Compliance dashboard (HIPAA audit status) | P1 | 10 | Audit log summary, risk alerts |
| 2.12 | Template and smart phrase library management | P1 | 3 | Org-wide shared templates |

---

## Module 3: Scheduling

| # | Feature | Priority | Phase | Notes |
|---|---------|----------|-------|-------|
| 3.1 | Multi-provider day/week/month calendar view | P0 | 2 | Color-coded by provider |
| 3.2 | Appointment creation (patient, type, provider, room) | P0 | 2 | |
| 3.3 | Appointment types with custom duration | P0 | 2 | New patient vs follow-up vs telehealth |
| 3.4 | Room/resource management | P0 | 2 | Room availability per location |
| 3.5 | Provider availability and block schedules | P0 | 2 | Vacation, lunch, surgery blocks |
| 3.6 | Real-time appointment status tracking | P0 | 2 | Scheduled → Arrived → In Room → Seen → Discharged |
| 3.7 | Drag-and-drop rescheduling | P0 | 2 | Calendar drag-drop |
| 3.8 | Wait-list management | P1 | 2 | Auto-notify when slot opens |
| 3.9 | Recurring appointment scheduling | P1 | 2 | Weekly, monthly follow-ups |
| 3.10 | Patient self-scheduling (portal) | P1 | 2 | Configurable by appointment type |
| 3.11 | Automated SMS/email reminders | P1 | 8 | 48h and 24h before appointment |
| 3.12 | No-show and cancellation tracking | P1 | 2 | With automated follow-up |
| 3.13 | Telehealth appointment scheduling | P1 | 7 | Creates video room, sends join link |
| 3.14 | Multi-location schedule view | P1 | 2 | See all locations on one calendar |
| 3.15 | Color coding by appointment status and type | P0 | 2 | Visual priority at a glance |

---

## Module 4: Patient Registration & Check-In

| # | Feature | Priority | Phase | Notes |
|---|---------|----------|-------|-------|
| 4.1 | Patient search (name, DOB, phone, MRN) | P0 | 2 | Global patient search |
| 4.2 | New patient registration | P0 | 2 | Demographics, insurance, guarantor |
| 4.3 | Insurance card capture (photo upload) | P0 | 2 | Front and back scan |
| 4.4 | Real-time eligibility verification (270/271) | P0 | 6 | Via Availity — one click |
| 4.5 | Copay and balance display at check-in | P0 | 6 | From last ERA + estimated copay |
| 4.6 | Digital intake form — pre-visit (portal) | P0 | 2 | Sent 24–48h before visit |
| 4.7 | Intake form → chart auto-population | P0 | 2 | Chief complaint, HHx, meds, allergies |
| 4.8 | Consent form signing (digital) | P0 | 2 | HIPAA notice, treatment consent |
| 4.9 | Patient ID photo | P1 | 2 | Reduces fraud at check-in |
| 4.10 | Kiosk check-in flow | P2 | 10 | Self-service tablet at reception |
| 4.11 | Patient duplicate detection and merge | P1 | 2 | Flags potential duplicates at registration |
| 4.12 | Patient demographics update history | P1 | 2 | Audit log of all changes |
| 4.13 | Emergency contact management | P0 | 2 | Required for inpatient |

---

## Module 5: Patient Chart (EHR Core)

| # | Feature | Priority | Phase | Notes |
|---|---------|----------|-------|-------|
| 5.1 | Patient chart summary view (single screen) | P0 | 3 | Problems, meds, allergies, vitals, timeline |
| 5.2 | Active problem list (ICD-10 coded) | P0 | 3 | Add, resolve, update problems |
| 5.3 | Medication list (active, discontinued, historical) | P0 | 3 | With dosage, frequency, prescriber |
| 5.4 | Allergy list with reaction type | P0 | 3 | Drug, food, environmental |
| 5.5 | Vitals history with sparkline trends | P0 | 3 | BP, HR, Temp, O2, Weight, BMI, Pain |
| 5.6 | Immunization history | P0 | 3 | With registry sync (VaxCare) |
| 5.7 | Family and social history | P0 | 3 | Structured + free text |
| 5.8 | Surgical and hospitalization history | P0 | 3 | |
| 5.9 | Care gaps panel (HEDIS, preventive) | P0 | 9 | Inline in summary, not separate tab |
| 5.10 | Clinical timeline (all encounters, labs, orders) | P0 | 3 | Filterable by type and date |
| 5.11 | Lab result history with trend visualization | P0 | 4 | Reference range, trending, sparklines |
| 5.12 | Document upload and management | P0 | 3 | External records, imaging, signed forms |
| 5.13 | Patient sticky header (always visible) | P0 | 0 (UI) | Name, DOB, allergies, risk flags, quick actions |
| 5.14 | Multi-patient chart tabs (up to 5) | P1 | 3 | Browser-tab style with Ctrl+Tab |
| 5.15 | Chart search (within patient) | P1 | 3 | Search across all chart sections |
| 5.16 | Patient risk flags | P1 | 3 | High risk, care gap, outstanding balance |
| 5.17 | SDOH screening | P2 | 9 | PRAPARE tool, community resource referral |
| 5.18 | Care plan builder | P2 | 9 | Goals, interventions, outcomes |

---

## Module 6: Encounter Documentation

| # | Feature | Priority | Phase | Notes |
|---|---------|----------|-------|-------|
| 6.1 | SOAP note template | P0 | 3 | Chief complaint, HPI, ROS, Exam, A&P |
| 6.2 | Smart phrases / dot phrases | P0 | 3 | Type `.xxx` to expand template |
| 6.3 | Free text + structured hybrid notes | P0 | 3 | Not forced into rigid fields |
| 6.4 | Copy-forward with mandatory review | P0 | 3 | Never blind copy — requires review |
| 6.5 | Auto-populated header (meds, allergies, problems) | P0 | 3 | Pre-loaded in every note |
| 6.6 | ROS (Review of Systems) structured entry | P0 | 3 | Tap/click to select systems reviewed |
| 6.7 | Physical exam structured entry | P0 | 3 | Configurable by specialty |
| 6.8 | Assessment & Plan with inline ordering | P0 | 3 | Order labs, Rx, referrals from within A&P |
| 6.9 | E&M code auto-suggestion | P0 | 3 | MDM or time-based; provider confirms |
| 6.10 | Note signing (1 click) | P0 | 3 | Ctrl+Enter shortcut |
| 6.11 | Addendum to signed notes | P0 | 3 | Cannot modify signed note; addendum only |
| 6.12 | Note templates by appointment type | P1 | 3 | AWV, new patient, follow-up |
| 6.13 | Voice dictation (browser-based) | P1 | 3 | Web Speech API initially |
| 6.14 | AI ambient documentation | P2 | 3 | Suki/Nabla partnership — future |
| 6.15 | Co-sign workflow (student/resident notes) | P1 | 3 | Attending must co-sign |
| 6.16 | After-visit summary auto-generation | P1 | 3 | Patient-friendly from note content |
| 6.17 | Telehealth encounter documentation | P1 | 7 | With modifier 95 pre-populated |
| 6.18 | Encounter history with version tracking | P1 | 3 | All drafts, edits, addenda preserved |

---

## Module 7: Orders

| # | Feature | Priority | Phase | Notes |
|---|---------|----------|-------|-------|
| 7.1 | Lab order creation (Quest, LabCorp, in-house) | P0 | 4 | HL7 OML message to Quest |
| 7.2 | Favorite / common order sets per provider | P0 | 4 | 1-click common labs (CBC, BMP, HbA1c) |
| 7.3 | Lab result receipt and parsing (HL7 ORU) | P0 | 4 | Results auto-matched to patient |
| 7.4 | Lab result review and sign-off | P0 | 4 | Normal/abnormal flagging |
| 7.5 | Lab result trend visualization | P0 | 4 | Sparkline for A1c, TSH, etc. |
| 7.6 | Critical value alert (STAT results) | P0 | 4 | Tier-1 interruptive alert |
| 7.7 | Imaging order creation | P1 | 4 | Radiology requisition |
| 7.8 | Imaging result receipt | P1 | 4 | PDF attachment from radiology |
| 7.9 | Referral order creation | P1 | 4 | Specialty, urgency, clinical reason |
| 7.10 | Referral tracking and closure | P1 | 4 | Status: Sent → Scheduled → Completed |
| 7.11 | Prior authorization tracking | P1 | 6 | Linked to order; PA status visible |
| 7.12 | Electronic prior authorization (DaVinci PAS) | P2 | 6 | FHIR-based; mandated Jan 2027 |
| 7.13 | Order sets (condition-based bundles) | P2 | 4 | Diabetes bundle, hypertension bundle |
| 7.14 | Order history and audit trail | P0 | 4 | Who ordered, when, result received |

---

## Module 8: Prescribing (e-Prescribing)

| # | Feature | Priority | Phase | Notes |
|---|---------|----------|-------|-------|
| 8.1 | e-Prescribing (Surescripts via ScriptSure) | P0 | 5 | NewRx, refills, cancel, change |
| 8.2 | EPCS (controlled substance e-prescribing) | P0 | 5 | DEA-audited 2FA via ScriptSure |
| 8.3 | Drug-drug interaction check | P0 | 5 | Real-time alert at prescribing |
| 8.4 | Drug-allergy interaction check | P0 | 5 | Against patient's allergy list |
| 8.5 | PDMP query (embedded, no separate login) | P0 | 5 | Bamboo Health / state PDMP |
| 8.6 | Formulary and drug coverage check | P1 | 5 | Patient's plan coverage |
| 8.7 | Real-Time Benefit Check (RTBC) | P1 | 5 | Patient's exact out-of-pocket cost |
| 8.8 | Medication favorites per provider | P1 | 5 | Quick-prescribe common Rx |
| 8.9 | Refill request management | P0 | 5 | From pharmacy → inbox → approve/deny |
| 8.10 | Medication history from Surescripts | P1 | 5 | External fills from any pharmacy |
| 8.11 | Rx panel as right sidebar (no page navigation) | P0 | 0 (UI) | UX requirement |
| 8.12 | Prescription history and audit trail | P0 | 5 | All Rx actions logged |

---

## Module 9: Inbox and Messaging

| # | Feature | Priority | Phase | Notes |
|---|---------|----------|-------|-------|
| 9.1 | Unified priority inbox | P0 | 3 | Labs → PA requests → messages → FYI |
| 9.2 | Secure provider-to-provider messaging | P0 | 3 | Within tenant |
| 9.3 | Secure provider-to-patient messaging (portal) | P0 | 8 | HIPAA-compliant; no PHI in email |
| 9.4 | Message assignment and delegation | P1 | 3 | Assign to MA, forward to colleague |
| 9.5 | Message templates | P1 | 3 | "Your lab results are normal. ..." |
| 9.6 | Patient portal message thread | P0 | 8 | Thread view per patient |
| 9.7 | Read receipt for patient messages | P1 | 8 | Provider sees when patient read |
| 9.8 | Automated responses (after hours) | P2 | 8 | "We'll respond within 1 business day" |
| 9.9 | Inbox zero workflow | P1 | 3 | Archive, snooze, delegate, complete |
| 9.10 | Notification preferences per user | P1 | 8 | Which events trigger in-app vs SMS vs email |

---

## Module 10: Billing and Revenue Cycle

| # | Feature | Priority | Phase | Notes |
|---|---------|----------|-------|-------|
| 10.1 | Charge capture from signed encounter | P0 | 6 | Auto-generates charges from note |
| 10.2 | CPT and ICD-10 coding assistance | P0 | 6 | AI-suggested codes from documentation |
| 10.3 | Claim scrubbing (pre-submission edits) | P0 | 6 | Plain-language error descriptions |
| 10.4 | 837P claim generation | P0 | 6 | Professional claim format |
| 10.5 | Clearinghouse submission (Availity) | P0 | 6 | Via Availity EDI |
| 10.6 | 270/271 eligibility verification | P0 | 6 | One-click at check-in |
| 10.7 | 835 ERA posting (automated) | P0 | 6 | Auto-match payment to claim |
| 10.8 | Denial queue with prioritization | P0 | 6 | Sorted by dollar amount + age |
| 10.9 | Denial reason with plain-language explanation | P0 | 6 | And suggested correction action |
| 10.10 | Claim correction and resubmission | P0 | 6 | |
| 10.11 | A/R aging dashboard (30/60/90/120+ days) | P0 | 6 | Per provider and per payer |
| 10.12 | Patient payment collection (Stripe) | P0 | 6 | Copay, coinsurance, balance |
| 10.13 | Payment plan setup | P1 | 6 | Recurring payment via Stripe |
| 10.14 | Good Faith Estimate generation | P0 | 6 | No Surprises Act compliance |
| 10.15 | Prior auth status on claim | P0 | 6 | Visible without navigating away |
| 10.16 | Billing KPI dashboard (real-time) | P1 | 6 | Clean claim rate, denial rate, days in AR |
| 10.17 | Bulk claim submission | P1 | 6 | Submit all ready claims in one action |
| 10.18 | Secondary insurance billing | P1 | 6 | Crossover claims |
| 10.19 | Fee schedule management | P0 | 6 | CPT code pricing by payer |
| 10.20 | Patient statement generation | P1 | 6 | PDF or portal delivery |

---

## Module 11: Telehealth

| # | Feature | Priority | Phase | Notes |
|---|---------|----------|-------|-------|
| 11.1 | Telehealth appointment scheduling | P0 | 7 | Creates video session automatically |
| 11.2 | Patient join link (SMS + portal) | P0 | 7 | Via Twilio SMS + portal button |
| 11.3 | Provider video panel (right sidebar in chart) | P0 | 7 | Does not navigate away from chart |
| 11.4 | Patient waiting room | P0 | 7 | Patient waits; provider admits |
| 11.5 | Local dev: Jitsi Docker | P0 | 0 (UI) | Self-hosted for dev/test |
| 11.6 | Production: Amazon Chime SDK | P0 | 7 | Pay-per-use, HIPAA BAA |
| 11.7 | In-session documentation | P0 | 7 | Note open during call |
| 11.8 | Screen sharing | P1 | 7 | Provider can share screen |
| 11.9 | Session recording | P2 | 7 | With patient consent; stored S3 |
| 11.10 | Telehealth billing (modifier 95 auto-populated) | P0 | 7 | Correct place-of-service code |
| 11.11 | Virtual waiting room capacity | P1 | 7 | Multiple patients waiting |

---

## Module 12: Notifications and Communications

| # | Feature | Priority | Phase | Notes |
|---|---------|----------|-------|-------|
| 12.1 | Appointment reminder SMS (Twilio) | P0 | 8 | 48h and 24h before appointment |
| 12.2 | Appointment reminder email (SES) | P0 | 8 | Same schedule |
| 12.3 | Appointment confirmation on booking | P0 | 8 | Immediate confirmation |
| 12.4 | Cancellation / reschedule notification | P0 | 8 | Patient and provider |
| 12.5 | Lab result ready notification (portal) | P0 | 8 | "Your results are available" — no PHI in SMS |
| 12.6 | Secure message notification (portal) | P0 | 8 | "You have a new message" |
| 12.7 | In-app notification bell | P0 | 3 | Real-time alerts within portal |
| 12.8 | Patient broadcast messaging | P1 | 8 | Recall campaigns, health alerts |
| 12.9 | Provider paging / urgent notification | P1 | 8 | For STAT results — SMS to provider |
| 12.10 | Notification preference management | P1 | 8 | Per patient: SMS vs email vs portal |
| 12.11 | Fax (eFax) for referrals and records | P1 | 8 | Outbound only initially |

---

## Module 13: Population Health and Analytics

| # | Feature | Priority | Phase | Notes |
|---|---------|----------|-------|-------|
| 13.1 | Provider dashboard (daily schedule, inbox count) | P0 | 3 | Landing screen after login |
| 13.2 | Care gaps panel (HEDIS measures) | P1 | 9 | Per patient + population level |
| 13.3 | Chronic disease panel (diabetes, HTN) | P1 | 9 | Filter patients by condition + risk |
| 13.4 | HCC risk adjustment coding suggestions | P1 | 3 | During documentation |
| 13.5 | MIPS/MACRA quality measure tracking | P1 | 9 | For Medicare providers |
| 13.6 | Immunization registry reporting | P1 | 4 | HL7 VXU to state IIS |
| 13.7 | Preventive care outreach (list + campaign) | P2 | 9 | Patients due for mammogram, A1c, etc. |
| 13.8 | Custom report builder | P2 | 9 | Drag-and-drop fields |
| 13.9 | Analytics dashboards (Superset embedded) | P2 | 9 | Advanced population analytics |

---

## Module 14: Patient Portal

| # | Feature | Priority | Phase | Notes |
|---|---------|----------|-------|-------|
| 14.1 | Patient registration and login (Keycloak) | P0 | 1 | Phone + DOB + email signup |
| 14.2 | Appointment view (upcoming + past) | P0 | 2 | |
| 14.3 | Appointment self-scheduling | P1 | 2 | Configurable by clinic |
| 14.4 | Appointment cancellation | P0 | 2 | With minimum notice period |
| 14.5 | Digital intake form completion | P0 | 2 | Pre-visit intake |
| 14.6 | Secure messaging with care team | P0 | 8 | Thread per patient |
| 14.7 | Lab results (provider-released) | P0 | 4 | With provider note/context |
| 14.8 | Visit summary / after-visit notes | P0 | 3 | Plain language |
| 14.9 | Medication list view | P1 | 3 | Active medications |
| 14.10 | Prescription refill request | P1 | 5 | Routes to provider inbox |
| 14.11 | Bill pay (Stripe) | P0 | 6 | View balance + pay |
| 14.12 | Telehealth visit join | P0 | 7 | One big button |
| 14.13 | HIPAA privacy notice and consent | P0 | 1 | Signed at registration |
| 14.14 | Demographics update request | P1 | 2 | Patient requests → staff confirms |
| 14.15 | Health record download (FHIR) | P2 | 10 | ONC requirement |

---

## Module 15: Compliance and Security

| # | Feature | Priority | Phase | Notes |
|---|---------|----------|-------|-------|
| 15.1 | Full HIPAA audit log (all PHI access) | P0 | 1 | 7-year retention |
| 15.2 | Role-based access control (RBAC) | P0 | 1 | Via Keycloak + Spring Security |
| 15.3 | Multi-factor authentication (MFA) | P0 | 1 | TOTP or SMS |
| 15.4 | Session timeout and re-authentication | P0 | 1 | Configurable per role |
| 15.5 | Encryption at rest (AES-256) | P0 | 1 | Aurora + S3 encryption |
| 15.6 | Encryption in transit (TLS 1.2+) | P0 | 1 | ALB + CloudFront |
| 15.7 | Breach detection and notification workflow | P0 | 10 | HIPAA Breach Notification Rule |
| 15.8 | Data export and patient data request | P1 | 10 | HIPAA right of access |
| 15.9 | WCAG 2.1 AA accessibility (patient portal) | P0 | 0 (UI) | Required by May 2026 |
| 15.10 | SOC 2 Type II audit readiness | P1 | 10 | For enterprise sales |

---

## UI Phase Features (Phase 0 — Mock Only)

These features are built as interactive UI simulations first, with mock data, before any backend is implemented:

**Priority for UI phase (in order):**
1. Provider dashboard + patient chart summary (most complex, most important)
2. Scheduling calendar with all appointment statuses
3. Patient chart — all sections (S/E/M/P/O/V/L/I/R/B)
4. Encounter documentation with note editor + smart phrases
5. Inbox with priority triage
6. Billing KPI dashboard + claim queue
7. MA rooming workflow
8. Front desk check-in flow
9. Patient portal — all screens
10. Super Admin tenant management
11. Tenant Admin user management
12. Command palette (Ctrl+K) — works across all mock data
