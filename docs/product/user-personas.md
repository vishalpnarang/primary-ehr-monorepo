# User Personas — Primus EHR

All roles accessing the **provider portal** (except Patient, who uses the patient portal). Every persona includes workflows, daily pain points from current EHRs, goals, and permission boundaries.

---

## 1. Super Admin (Thinkitive Staff)

**Who:** Internal Thinkitive employee. Manages the entire Primus SaaS platform across all tenants. Not a healthcare provider.

**Goals:**
- Provision new tenant organizations (clinics)
- Monitor platform health across all tenants
- Manage global configuration, feature flags, compliance settings
- Support escalations from Tenant Admins
- Audit any tenant's data for compliance/support purposes

**Daily workflow:**
1. Review platform health dashboard (uptime, errors, queue depth)
2. Process new tenant onboarding requests
3. Configure integrations per tenant (Surescripts, Quest, Availity credentials)
4. Respond to support escalations with impersonation capability
5. Run compliance and audit reports across tenants
6. Manage Keycloak realm configurations

**Pain points in existing tools:**
- No visibility across tenants without logging into each separately
- Tenant provisioning is manual and error-prone
- No rollback for configuration mistakes
- Audit trail is fragmented across systems

**Permissions:**
- Full read/write access to ALL tenants
- Can impersonate any user for support (with audit log)
- Can enable/disable features per tenant
- Can hard-delete data (GDPR/legal requests only, requires 2FA confirmation)
- Can view all system logs, metrics, error traces

**Screen access:** Super Admin dashboard (tenant list, platform metrics, audit logs, feature flags, support tools)

---

## 2. Tenant Admin (Clinic Owner / Medical Director)

**Who:** The owner or medical director of a clinic organization. Typically a physician or business owner. Manages the entire clinic setup within Primus.

**Goals:**
- Set up and configure their clinic(s)
- Manage providers, staff, and their roles
- Configure billing, insurance, and scheduling rules
- Monitor clinic performance and revenue
- Ensure HIPAA compliance within their organization

**Daily workflow:**
1. Review clinic-level analytics dashboard (revenue, appointments, denials)
2. Add/deactivate staff members and assign roles
3. Configure appointment types, scheduling rules, and room availability
4. Review and approve billing configurations (fee schedules, payer contracts)
5. Monitor compliance alerts and audit logs
6. Set up integrations (lab panels, pharmacy, clearinghouse)

**Pain points in existing EHRs:**
- User management is buried and takes too many steps
- No real-time financial performance visibility
- Can't easily configure what each role can see/do
- Integration setup requires calling vendor support
- No way to compare provider performance without running manual reports

**Permissions:**
- Full access to their tenant's configuration
- Create/edit/deactivate users within their tenant
- View all patient records in their locations
- Configure billing, schedules, rooms, locations
- Cannot access other tenants
- Cannot delete patients (deactivate only)

**Screen access:** Tenant Admin dashboard, user management, location settings, billing config, integration config, analytics, audit logs

---

## 3. Practice Admin (Office Manager)

**Who:** Office manager who handles day-to-day operations. Not a clinician. Focused on scheduling efficiency, staff coordination, and operational metrics.

**Goals:**
- Keep the schedule full and efficient
- Resolve operational issues quickly
- Track no-shows, cancellations, and wait times
- Manage front desk and MA workflows
- Generate operational reports for the Tenant Admin

**Daily workflow:**
1. Morning: Review today's schedule for gaps, double-bookings, missing pre-auth
2. Manage provider schedules and availability for the week
3. Handle patient escalations from front desk
4. Monitor check-in status across all rooms
5. Pull daily/weekly operational reports
6. Oversee staff task queues and reassign as needed
7. End of day: review unsigned notes, outstanding orders

**Pain points in existing EHRs:**
- Schedule view is cluttered; can't see all providers at once
- No real-time room/patient status board
- Reporting requires exporting to Excel and manual manipulation
- Can't reassign tasks between staff without IT access
- No visibility into what's causing scheduling bottlenecks

**Permissions:**
- View and edit all appointments across their locations
- View (not edit) all patient demographics
- Cannot view clinical notes or PHI beyond demographics
- Manage staff schedules and availability
- View operational reports (not financial P&L)
- Cannot process payments or modify billing codes

**Screen access:** Operational dashboard, schedule management, room status board, staff task management, operational reports, patient demographics

---

## 4. Provider (MD / DO / NP / PA)

**Who:** The primary clinical user. Physicians, nurse practitioners, physician assistants. Sees patients, documents encounters, orders labs and medications, makes clinical decisions.

**Goals:**
- Complete clinical documentation efficiently without "pajama time"
- Have every patient's relevant history at a glance
- Prescribe, order labs, make referrals without leaving the patient chart
- Reduce documentation burden while maintaining quality
- Stay on time with the schedule

**Daily workflow:**
1. **Pre-visit (5 min per patient):** Review scheduled patients, check pre-visit summary — labs due, care gaps, last visit note, outstanding items
2. **Check-in notification:** MA completes rooming — provider gets notified patient is ready with vitals populated
3. **Encounter (20–30 min):**
   - Open patient chart — see summary, allergies, problem list, meds
   - Review chief complaint from intake
   - Document SOAP note (voice/smart phrases/templates)
   - Order labs, imaging, referrals inline in A&P
   - Prescribe medications inline
   - Close encounter — review auto-suggested E&M code, sign
4. **Between patients:** Review lab results in inbox, triage messages
5. **End of day:** Sign any outstanding notes, review priority inbox

**Pain points in existing EHRs (critical to solve in Primus):**
- **36+ minutes of EHR work per 30-minute visit** — the #1 problem
- Documentation requires navigating 5+ screens for a single encounter
- Alert fatigue — 96% of pop-ups are dismissed without reading
- Can't see everything needed on one screen — constant tab-switching
- Smart phrase / template system is clunky to create/edit
- Inbox is a single pile of everything — no priority triage
- After signing, billing often requires additional manual coding steps
- e-Prescribing is a separate application in many systems
- Referral tracking is manual with no closure loop

**Permissions:**
- Full read/write access to patients they are assigned to
- Can view any patient in their location
- Cannot modify other providers' signed notes (addendum only)
- Can prescribe controlled and non-controlled substances
- Can place and sign all order types
- Cannot modify billing codes after claim submission

**Key UX requirements:**
- Everything accessible from single patient chart view
- Command palette `Ctrl+K` for any action
- Note signing with one click
- E&M code auto-suggested — provider confirms, doesn't generate manually
- Lab ordering embedded in Assessment & Plan section of note
- Rx panel opens as right sidebar without leaving chart
- Inbox sorted by priority: critical labs → PA requests → messages → FYI

**Screen access:** Full provider portal — dashboard, schedule, patient chart (all sections), inbox, prescribing, orders, referrals, telehealth

---

## 5. Nurse / Medical Assistant (MA)

**Who:** Clinical support staff who room patients, take vitals, perform point-of-care testing, administer vaccinations, and support provider workflows.

**Goals:**
- Complete rooming workflow efficiently before provider enters the room
- Document vitals, chief complaint, and pre-visit intake without errors
- Track their task queue throughout the day
- Communicate with providers quickly without leaving the workflow

**Daily workflow:**
1. **Pre-shift:** Review today's schedule and prep tasks
2. **Rooming workflow (per patient):**
   - Pull patient from waiting room — update status to "In Room"
   - Take and enter vitals (BP, HR, Temp, O2, Height, Weight, BMI auto-calc)
   - Review/update medication list — note any changes patient reports
   - Review/update allergy list
   - Document chief complaint and HPI (brief)
   - Complete pre-visit checklist (insurance verified, consent signed, intake complete)
   - Notify provider: "Patient ready in Room 3"
3. **During encounter:** Available for provider requests — lab draws, medication admin, injections
4. **Post-encounter:** Discharge instructions given, follow-up scheduled if needed
5. **Task queue:** Process incoming MA tasks — prior auth paperwork, referral coordination, lab result notifications to patients

**Pain points in existing EHRs:**
- Vitals entry requires navigating away from the patient chart
- Medication reconciliation is a slow, multi-screen process
- No clear rooming checklist — steps missed regularly
- Status updates are not real-time — provider doesn't know patient is ready
- Task queue is mixed with provider tasks — no separation
- 98% of nurses say they were never included in EHR design decisions

**Permissions:**
- View full patient chart (read)
- Enter vitals, chief complaint, HPI, medications (reconciliation — suggest only, provider confirms)
- Document administered medications and vaccinations
- Update appointment status (rooming, ready, discharged)
- Cannot sign clinical notes
- Cannot prescribe medications
- Cannot finalize billing codes

**Key UX requirements:**
- Rooming workflow as a guided checklist — can't skip steps accidentally
- Vitals entry directly on the patient chart — not a popup
- One-click "Notify Provider" with room number sent to provider's dashboard
- Real-time room status board visible to all clinical staff
- Separate MA task queue from provider task queue

**Screen access:** Dashboard (MA view — schedule, room status board), patient chart (rooming tab), task queue, messaging

---

## 6. Front Desk / Scheduling

**Who:** Administrative staff who handle patient-facing front-of-house operations — answering phones, scheduling appointments, checking patients in, collecting payments.

**Goals:**
- Schedule appointments quickly without double-booking
- Check patients in smoothly and minimize wait time
- Verify insurance eligibility before each visit
- Collect copays and outstanding balances at check-in
- Handle cancellations and reschedules efficiently

**Daily workflow:**
1. **Morning prep:** Print or review today's schedule — flag patients with missing info or unverified insurance
2. **Phone scheduling:** Look up patient → check provider availability → book appointment → verify insurance → collect future-visit copay estimate
3. **Check-in:**
   - Patient arrives → confirm identity → update demographics if changed
   - Verify insurance (real-time eligibility check)
   - Collect copay / outstanding balance via Stripe
   - Hand off digital consent/intake form if not completed pre-visit
   - Update appointment status: Arrived → In Waiting Room
4. **Throughout day:** Answer phones, reschedule, handle patient inquiries, fax referrals
5. **End of day:** Reconcile payments collected, close daily batch

**Pain points in existing EHRs:**
- Scheduling interface has poor visual calendar — hard to find open slots
- Insurance eligibility requires logging into a separate payer portal
- Payment collection is a separate step from check-in — two systems
- Rescheduling is slow — can't drag-and-drop on calendar
- No patient balance visibility at check-in
- Digital intake forms don't integrate — staff re-enters data manually
- Appointment reminders are sent from a separate system

**Permissions:**
- View and edit all appointments across their location
- View patient demographics and insurance information
- Cannot view clinical notes
- Collect payments (copays, outstanding balances) — no access to fee schedules
- Verify insurance eligibility
- Send appointment reminders and intake form links
- Cannot modify billing codes or claims

**Key UX requirements:**
- Drag-and-drop scheduling calendar
- Insurance verification in one click from the check-in screen
- Payment collection embedded in check-in workflow
- Patient balance prominently displayed at check-in
- At-a-glance schedule view with color-coding by appointment type and status

**Screen access:** Schedule (full calendar), patient demographics, check-in workflow, payment collection, appointment reminders

---

## 7. Billing Staff

**Who:** Revenue cycle management specialists who process claims, manage denials, post payments, and optimize practice revenue.

**Goals:**
- Submit clean claims that pass on first submission
- Reduce days in AR to under 30
- Work denial queue efficiently with clear reasons and one-click appeal
- Reconcile insurance payments (ERA) with expected amounts
- Track KPIs: clean claim rate, denial rate, collection rate

**Daily workflow:**
1. **Morning:** Review claim scrubber alerts — fix errors before submission
2. **Claim submission:** Review charge queue from yesterday's signed encounters → verify CPT/ICD-10 mapping → submit to clearinghouse (Availity)
3. **ERA processing:** Post electronic remittances — match to claims → identify underpayments and denials
4. **Denial management:** Work denial queue by priority → identify root cause → correct and resubmit or appeal
5. **A/R follow-up:** Work aging A/R buckets (30/60/90/120+ days)
6. **Reporting:** Pull daily KPI dashboard — denial rate, clean claim rate, days in AR, collections by provider

**Pain points in existing EHRs:**
- Claim scrubber errors are cryptic — no plain-language explanation
- Denial queue has no prioritization — all denials look equally urgent
- ERA posting is manual in many systems — one payment at a time
- No visibility into why a specific claim was denied until ERA arrives (days later)
- CPT/ICD-10 coding suggestions are poor — providers often leave codes incomplete
- Prior auth status is not tracked in the EHR — billing staff calls payer to check
- Reporting requires exporting to Excel — no real-time dashboard

**Permissions:**
- View all patient demographics and insurance
- View encounter documentation (read-only) to support coding decisions
- Create, edit, and submit claims
- Post payments and adjustments
- Work denial queue
- Cannot modify signed clinical notes
- Cannot access provider schedules or clinical orders

**Key UX requirements:**
- Plain-language denial reason with suggested correction action
- Denial queue sorted by dollar amount and age
- ERA auto-matching to claims with exceptions highlighted
- Real-time billing KPI dashboard (no export required)
- Prior auth status visible on claim without navigating away
- Bulk claim submission and batch ERA posting

**Screen access:** Billing dashboard (KPIs), charge queue, claim management, ERA/posting, denial queue, A/R aging, reports

---

## 8. Patient (Patient Portal)

**Who:** The patient receiving care. Accesses a separate patient portal. Typically non-technical; may be elderly or have limited health literacy.

**Goals:**
- View upcoming appointments and visit summaries
- Message their care team securely
- Access lab results with explanations
- Complete intake forms before visits
- Pay bills online
- Join telehealth visits

**Patient journey touchpoints:**
1. **Pre-visit:** Receive appointment reminder (SMS/email) → complete digital intake form → review/update demographics and insurance
2. **During visit:** (Provider portal handles this)
3. **Post-visit:** Receive visit summary → view lab results when available → follow up with message if needed
4. **Ongoing:** Request prescription refills → message care team → pay outstanding balance → book follow-up

**Pain points in existing patient portals:**
- Sign-up is too complicated — 32% abandon before completing registration
- Test results appear before provider has reviewed — causes anxiety with no context
- Bill pay is on a completely separate platform from clinical records
- Messages go into a black hole — no sense of when to expect a reply
- Mobile experience is unusable on small screens
- After-visit summaries are written in medical jargon

**Permissions:**
- View their own records only
- View lab results (released by provider, not auto-released)
- Send and receive secure messages (not email — authenticated portal only)
- Book and cancel appointments (configurable by clinic)
- Submit intake forms
- Pay bills
- Join telehealth sessions
- Cannot view other patients' data
- Cannot modify clinical information

**Key UX requirements (patient portal):**
- Mobile-first design — works flawlessly on iPhone/Android
- Registration in under 3 minutes — phone number + DOB + email
- Lab results show provider's interpretation note before the raw numbers
- Bill pay is embedded — one login, one place
- Appointment join telehealth = one big green button — no complexity
- After-visit summary in plain language with glossary for medical terms
- Unread message badge — clear indication when provider has replied

**Screen access (patient portal):** Home/dashboard, appointments, messages, health records (labs, visit summaries), billing, intake forms, telehealth join
