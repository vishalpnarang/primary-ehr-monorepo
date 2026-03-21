# User Flows — Primus EHR

Every major workflow documented step by step. These flows define what the React simulation must support in Phase 0 (UI-first).

---

## Flow 1: Patient Registration (Front Desk)

**Actor:** Front Desk staff  
**Entry point:** Patient calls to schedule first appointment / walks in

### Steps:
1. Click `Patients` in sidebar → `+ New Patient`
2. **Step 1 — Demographics:**
   - First name, Last name, DOB (required)
   - Phone (mobile preferred — used for SMS reminders)
   - Email (optional — used for portal invite)
   - Gender, sex at birth, preferred pronouns
   - Address (Google Maps autocomplete)
   - Emergency contact name + phone
3. **Step 2 — Insurance:**
   - Primary insurance: payer name (searchable dropdown) + member ID + group number
   - Insurance card photo upload (front + back) — optional but recommended
   - Secondary insurance (optional)
   - Self-pay option
4. **Step 3 — Review + Save:**
   - Duplicate check runs automatically — if match found, show "Possible duplicate" card with option to merge or continue
   - Save → Patient created with MRN auto-generated (`PAT-XXXXX`)
   - Option: "Schedule appointment now" → takes to scheduling
   - Option: "Send patient portal invite" → sends SMS/email with registration link

**Success state:** Patient created, MRN displayed, option to schedule or send portal invite

---

## Flow 2: Appointment Scheduling (Front Desk / Patient Self-Schedule)

**Actor:** Front Desk staff (or Patient via portal)  
**Entry point:** Patient search → Schedule tab, or Schedule → New Appointment

### Steps (Front Desk):
1. Search patient (name, DOB, phone, MRN) → select patient
2. Click `Schedule Appointment` or navigate to `/schedule/new`
3. Select:
   - Appointment type (New Patient / Follow-up / Annual Wellness / Telehealth / etc.)
   - Provider (dropdown — shows only providers accepting this appointment type)
   - Date (calendar picker — shows provider availability in green)
   - Time slot (available slots shown — duration auto-set by appointment type)
   - Location (if multi-location)
   - Room (auto-assigned or manual)
4. Add note (reason for visit — free text, visible to clinical team)
5. Confirm → Appointment booked
6. **Post-booking actions (auto-triggered):**
   - Confirmation SMS sent to patient
   - If digital intake not yet sent → prompt: "Send intake form?" → Yes → SMS sent with link
   - Eligibility verification queued (runs 24h before appointment)

### Steps (Patient portal self-schedule):
1. Log into patient portal → `Book Appointment`
2. Select appointment type (limited list — clinic configures which types allow self-scheduling)
3. Select preferred provider or "Any available"
4. Calendar shows available dates/times → click slot
5. Add reason (optional)
6. Review + Confirm
7. Confirmation shown + SMS/email sent

---

## Flow 3: Pre-Visit Workflow (48h–24h before appointment)

**Actor:** Automated system + Patient + Front Desk  

### Steps:
1. **48h before:** Automated appointment reminder SMS + email sent
2. **24h before:** Intake form link sent via SMS/email (if not already completed)
3. **Patient completes intake form (portal or mobile link):**
   - Chief complaint / reason for visit
   - Medications (review/update list from chart)
   - Allergies (review/update)
   - Health history updates (new conditions, surgeries, hospitalizations)
   - Family history updates
   - Social history (smoking, alcohol, exercise)
   - Consent to treatment (digital signature)
4. **Intake data auto-populates into patient chart** — flagged as "Patient-reported, unreviewed"
5. **Day of:** Front desk sees "Intake ✓" indicator on schedule for completed forms
6. **Eligibility verification** runs automatically 24h before — result shown at check-in

---

## Flow 4: Patient Check-In (Front Desk)

**Actor:** Front Desk staff  
**Entry point:** Schedule view → patient arrives → click appointment → Check In

### Steps:
1. Patient arrives → Front Desk finds appointment on schedule
2. Click appointment → appointment drawer opens
3. Click `Check In`
4. **Check-in screen shows:**
   - Patient demographics (with edit button if update needed)
   - Insurance on file + eligibility status (✓ Verified / ⚠ Unverified / ✗ Error)
   - If unverified: `Verify Now` button → runs 270/271 in real-time
   - Outstanding balance: `$XX.XX` → `Collect Payment` button
   - Intake form status: ✓ Complete / ⚠ Not started → `Send Link` button
   - Consent forms: ✓ Signed / `Send for Signature`
5. Collect copay/payment via Stripe (if balance exists)
6. Click `Complete Check-In` → appointment status changes to `Arrived`
7. Patient appears in waiting room queue — visible on room status board

---

## Flow 5: Patient Rooming (Nurse / MA)

**Actor:** Nurse or Medical Assistant  
**Entry point:** Dashboard → Room Status Board → click patient from Arrived queue

### Steps:
1. MA sees "Arrived" patients on room status board
2. Calls patient from waiting room
3. Clicks patient on board → opens rooming checklist
4. **Rooming checklist (guided, cannot skip):**
   - [ ] Confirm patient identity (name + DOB)
   - [ ] Room assignment (select room from available list)
   - [ ] Record vitals:
     - Blood Pressure (systolic / diastolic)
     - Heart Rate
     - Temperature (°F)
     - O2 Saturation (%)
     - Weight (lbs/kg toggle)
     - Height (ft/in) → BMI auto-calculated
     - Pain scale (0–10 slider)
     - Respiratory Rate
   - [ ] Review chief complaint (from intake — edit if patient reports differently)
   - [ ] Medication reconciliation (review intake-reported meds vs chart meds)
   - [ ] Allergy confirmation (ask patient, check against chart)
   - [ ] Review outstanding care gaps → note any patient declines
5. Mark checklist complete → click `Notify Provider`
6. Provider receives notification: "Patient ready in Room 3 — [Patient Name]"
7. Appointment status updates to `In Room`

---

## Flow 6: Clinical Encounter (Provider)

**Actor:** Provider  
**Entry point:** Dashboard notification "Patient ready in Room 3" OR schedule → click appointment

### Steps:
1. Provider clicks notification or appointment → patient chart opens to **Summary** tab
2. **Pre-encounter review (60 seconds):**
   - Scan summary: active problems, meds, allergies, recent vitals (just entered by MA)
   - Scan care gaps panel: anything due today?
   - Scan timeline: last visit, any outstanding orders?
3. Click `New Note` (or press `N`) → encounter note opens
4. **Documentation:**
   a. Chief complaint auto-pulled from intake (editable)
   b. HPI: free text with `.` smart phrase expansion (e.g., `.hpi` expands template)
   c. ROS: tap systems to review → auto-populates "All other systems reviewed and negative"
   d. Physical exam: tap findings → structured documentation
   e. Assessment & Plan:
      - Type diagnosis → ICD-10 search → select
      - For each diagnosis: type plan → inline order buttons appear
      - `[+ Order Lab]` → opens lab order panel on right side (no navigation)
      - `[+ Prescribe]` → opens Rx panel on right side (no navigation)
      - `[+ Refer]` → opens referral panel on right side
   f. E&M code: auto-suggested at bottom based on MDM documentation
5. Click `Sign & Close` (or `Ctrl+Enter`) → encounter is signed
6. **Post-sign actions (auto-triggered):**
   - Charges generated from CPT codes → goes to billing queue
   - After-visit summary generated → queued for patient portal release
   - Any lab orders transmitted to Quest via HL7
   - Any Rx sent to pharmacy via Surescripts
   - Appointment status → `Seen`
7. Provider moves to next patient

---

## Flow 7: e-Prescribing (Within Encounter or Standalone)

**Actor:** Provider  
**Entry point:** Encounter A&P `[+ Prescribe]` button OR Medications tab `[+ New Rx]`

### Steps:
1. Rx panel opens as right-side drawer (patient chart remains visible)
2. Search drug by name (generic or brand) → autocomplete
3. Select drug → shows:
   - Strength options
   - Dosage form (tablet, capsule, liquid)
   - Directions (SIG) — common choices + free text
   - Quantity + days supply
   - Refills
   - Pharmacy (patient's preferred pharmacy pre-selected)
   - **Real-Time Benefit Check:** shows patient's out-of-pocket cost for this drug
   - **Drug interaction check:** instant — shows any interactions with current meds
   - **PDMP query:** automatic — shows patient's controlled substance history (no separate login)
4. If controlled substance (Schedule II–V):
   - EPCS 2FA prompt (ScriptSure) → provider authenticates
   - PDMP check is mandatory before signing
5. Review → `Send to Pharmacy`
6. Rx sent via Surescripts → confirmation shown
7. Medication added to patient's active medication list

---

## Flow 8: Lab Order and Result (Provider + Nurse)

**Actor:** Provider (orders), Nurse (collects), System (receives results)  

### Ordering:
1. In encounter A&P: type test name → `[+ Order Lab]`
2. Lab order panel opens as right drawer
3. Select:
   - Lab facility (Quest / Tribal / In-house)
   - Test(s) — searchable + favorites panel
   - Priority (Routine / STAT)
   - Collection type (venipuncture / POC / patient service center)
   - Clinical indication (ICD-10 links to order)
   - Special instructions
4. `Send Order` → HL7 OML message sent to Quest
5. Order appears in `Orders` tab — status: `Pending Collection`

### Result receipt:
1. Quest returns HL7 ORU message → auto-parsed
2. Result matched to patient and order → appears in `Labs` tab
3. Provider inbox receives notification: `[Lab Result Ready]`
4. Provider opens result:
   - All values shown with reference ranges
   - Abnormal values highlighted (high/low with color)
   - Critical values → **Tier-1 alert** (interruptive modal)
5. Provider reviews → `Sign Off` (with optional comment)
6. If comment added → queued for patient portal release after provider review
7. Patient receives notification: "Your lab results are available in your portal"

---

## Flow 9: Billing and Claims (Billing Staff)

**Actor:** Billing Staff  
**Entry point:** Billing dashboard → Charge Queue

### Steps:
1. Signed encounters from yesterday appear in charge queue
2. Billing staff reviews each charge:
   - CPT codes (auto-generated from E&M + procedure codes)
   - ICD-10 diagnosis codes
   - Modifiers (if applicable)
   - Rendering provider NPI
   - Place of service
3. `Claim Scrubber` runs automatically — shows any errors in plain language:
   - "Missing modifier for telehealth service" → click to fix
   - "ICD-10 code not covered by this payer" → click to fix
4. Fix errors → `Approve` claim
5. `Submit Batch` → 837P file sent to Availity clearinghouse
6. Clearinghouse acknowledgment received (real-time or 24h) → claim status updated

### ERA posting:
1. Payment received from payer → 835 ERA file arrives from Availity
2. System auto-matches ERA lines to claims
3. Matched payments → auto-posted
4. Exceptions (underpayments, denials, adjustments) → highlighted for review
5. Billing staff reviews exceptions → post, adjust, or dispute

### Denial management:
1. Denied claim appears in **Denial Queue** sorted by: dollar amount (desc) then age
2. Click denial → shows:
   - Denial reason (plain language, not just CARC code)
   - Suggested correction action
   - Original claim details
   - Patient and insurance info
3. Correction options:
   - Fix and resubmit (most common)
   - File appeal (with appeal letter template)
   - Write off (with reason code)
   - Request peer-to-peer review
4. Track denial status → resolved or escalated

---

## Flow 10: Patient Portal Messaging

**Actor:** Patient (sends), Provider/MA (receives and replies)  

### Patient sends message:
1. Patient logs into portal → `Messages` → `New Message`
2. Select: `My Care Team at [Clinic Name]`
3. Subject (dropdown: Question about my visit / Medication question / Request records / Other)
4. Message body (plain text, max 2000 chars)
5. Optional attachment (photo, PDF)
6. `Send` → message appears in provider's inbox

### Provider receives and replies:
1. Inbox shows new message → category: `Patient Messages`
2. Click message → thread view opens
3. Read → draft reply
4. Option to `Assign to MA` → MA drafts response → provider approves
5. `Send Reply` → patient receives notification: "You have a new message from [Clinic]"
6. No PHI sent in SMS/email — notification only; patient must log in to read

---

## Flow 11: Telehealth Visit

**Actor:** Provider + Patient  

### Setup (scheduled in advance):
1. Appointment created as `Telehealth` type
2. Video room auto-created (Jitsi local / Chime prod)
3. Patient receives SMS + portal button: "Join your telehealth visit"

### Day of visit:
1. **Patient:** Opens portal → clicks `Join Telehealth` → enters virtual waiting room
2. **Provider:** Dashboard shows "Telehealth patient waiting" notification
3. Provider opens patient chart → clicks `Join Video` → video panel opens as right sidebar
4. Provider admits patient from waiting room → video call starts
5. Provider can see patient chart AND video simultaneously (split view)
6. Document encounter normally — note is open during call
7. End call → video panel closes → note remains open → sign & close

---

## Flow 12: New Tenant Onboarding (Super Admin)

**Actor:** Super Admin  
**Entry point:** Settings → Tenants → New Tenant

### Steps:
1. Click `+ New Tenant` → provisioning wizard opens (4 steps)
2. **Step 1 — Organization info:**
   - Practice name
   - NPI (National Provider Identifier)
   - Tax ID / EIN
   - Primary admin email → becomes first Tenant Admin
   - Address and phone
3. **Step 2 — Technical setup:**
   - Subdomain (`[clinic].primusehr.com`)
   - Data region (US-East-1 / US-West-2)
   - Feature set (which modules to enable)
4. **Step 3 — Integrations:**
   - Quest Lab credentials (if applicable)
   - Surescripts/ScriptSure credentials
   - Availity API key
   - Twilio credentials (or use platform shared)
   - Stripe account (or platform shared)
5. **Step 4 — Review + Provision:**
   - Summary of all settings
   - `Provision Tenant` → background job runs:
     - Creates Keycloak realm with default roles
     - Creates DB schema (`primus_[tenantid]`)
     - Creates Tenant Admin Keycloak user
     - Sends welcome email to Tenant Admin with setup link
6. Provisioning status shown → complete when all jobs green

---

## Flow 13: Provider Day-End Workflow

**Actor:** Provider  
**Entry point:** Dashboard → end of last appointment

### Steps:
1. Complete last encounter → sign note
2. Review inbox:
   - Any unsigned notes from today? → "You have 2 unsigned notes" banner
   - Any critical labs not yet reviewed? → Badge on inbox icon
   - Any urgent messages?
3. Sign remaining notes (can do in bulk if desired)
4. Review and act on critical lab results
5. Review any refill requests → approve or deny
6. Log out → session timeout kicks in after 15 minutes of inactivity

---

## Error and Edge Case Flows

### Duplicate patient detected at registration:
- Show side-by-side comparison of existing and new patient
- Options: `It's the same person — merge` | `Different patient — create new`
- Merge requires supervisor approval (logged in audit trail)

### Insurance eligibility fails:
- Show "Eligibility check failed" with payer error message
- Options: `Retry` | `Manual override` | `Mark as self-pay`
- Manual override requires note (reason documented)

### Lab result — critical value:
- Tier-1 interruptive modal (cannot be dismissed with Escape alone)
- Requires provider to click `I Acknowledge — Patient Notified` to close
- Action logged in audit trail with timestamp and provider name
- If provider doesn't acknowledge within 30 minutes → escalation notification

### Encounter note auto-save failure:
- Banner: "Auto-save failed — your note is saved locally"
- Retry indicator with manual `Save Draft` button
- On reconnect → sync local draft to server
- Never lose note content

### PDMP check fails (network error):
- Show warning: "PDMP unavailable — documenting exception"
- Provider must acknowledge and document reason before prescribing controlled substance
- Incident logged for compliance

### Payment declined at check-in:
- Show decline reason from Stripe
- Options: `Try different card` | `Skip and bill later` | `Set up payment plan`
- All declined attempts logged
