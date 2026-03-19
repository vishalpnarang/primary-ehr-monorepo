# EHR Product Requirements: General EHR & Primary Care

**The US EHR market — valued at ~$12.9 billion in 2024 — is dominated by systems that score in the bottom 9% of all technologies for usability.** Physicians spend 5.8 hours on EHR tasks for every 8 hours of patient time, and 62% of burned-out clinicians blame their EHR directly. This creates an extraordinary opening for a new system purpose-built for primary care that prioritizes speed, keyboard-first workflows, and single-screen design. What follows is a comprehensive feature specification and design guidelines document synthesizing research across the top 100 EHR systems, regulatory requirements through 2026, market economics, and evidence-based UX patterns.

---

## Section 1: Competitive landscape and top EHR features

### Market overview (2024–2026)

- **Epic Systems** — 42.3% hospital market share, 43.9% ambulatory; won ~70% of all new hospital contracts in 2024; revenue $5.7B. Most praised features: Care Everywhere interoperability, Healthy Planet population health, customizable dashboards, MyChart patient portal
- **Oracle Health (Cerner)** — 22.9% hospital share; lost 74 hospitals in 2024; strongest in large health systems; revenue ~$5.3B
- **athenahealth** — leads small/mid-size ambulatory practices; cloud-native rules engine; network intelligence ("athenaNet") auto-updates billing rules; revenue ~$1.4B; pricing at 4–7% of collections
- **eClinicalWorks** — largest cloud EHR by volume; excels at HEDIS analytics and population health; pricing ~$449/provider/month
- **NextGen Healthcare** — top-rated for internal medicine and multi-specialty; acquired by Thoma Bravo for $1.8B; deep customization praised universally
- **Elation Health** — speed benchmark for primary care; "cockpit view" 3-pane console; Best in KLAS two consecutive years for small practice EHR
- **ModMed** — adaptive learning engine; specialty-specific; "virtually keyboardless" experience; saves ~2 hours/day per provider
- **DrChrono** — iPad-first, voice-friendly, strong for independent practices
- **Kareo / Tebra** — best for solo/small practices; praised for ease of use and attentive customer support
- **AdvancedMD** — strong RCM integration; cloud-based; acquired by Francisco Partners

---

### Features most praised across top EHR systems

#### Clinical documentation
- **Smart phrases / macros / dot phrases** — type `.hpi` to expand a full structured template; reduces keystrokes by 60–70%
- **Copy-forward with mandatory review** — surfaces prior visit data for review before re-signing, not blind copying
- **Hybrid structured + free-text notes** — structured fields for billing compliance, free-text for clinical reasoning
- **Voice dictation integration** — built-in or ambient AI scribe layer (DAX, Suki, Nabla, Abridge)
- **Auto-populated fields** — allergies, problem list, medications pulled into every note header automatically
- **After-visit summary generation** — auto-generated patient instructions from note content

#### Orders and prescribing
- **e-Prescribing (Surescripts certified)** — NewRx, refills, cancellations, fill notifications in one workflow
- **EPCS for controlled substances** — two-factor authentication, DEA-audited; mandated in 35+ states
- **Real-Time Benefit Check (RTBC)** — shows patient's exact out-of-pocket cost at prescribing time; reduces callback volume by ~40%
- **PDMP embedded in prescribing** — no separate login; state prescription monitoring pulled during Rx workflow
- **Medication reconciliation** — automated comparison of imported meds vs. active list with one-click reconciliation
- **Common order sets / favorites** — provider-personalized order panels; one-click common labs

#### Primary care specific features
- **Chronic disease management dashboards** — diabetes (A1c trending), hypertension (BP tracking), COPD panels with filter by risk tier
- **Care gap alerts** — surfaced during visit (not on chart open); overdue screenings, vaccinations, preventive measures
- **Annual wellness visit (AWV) workflow** — pre-populated templates for Medicare G0438/G0439 with auto-suggested HCCs
- **Preventive care reminders** — mammogram, colonoscopy, flu shot, A1c, based on patient age/sex/conditions
- **HEDIS measure tracking** — real-time HEDIS performance visible per patient and at panel level
- **Immunization registry integration** — bidirectional with state IIS (HL7 V2.5.1 VXU/VXR)
- **Referral management** — outbound referral creation, tracking, closed-loop return with specialist notes
- **HCC risk adjustment coding** — AI-suggested HCC codes during documentation for value-based contracts
- **Tobacco/alcohol/SDOH screening** — AUDIT-C, CAGE, PRAPARE auto-scored and linked to care plan
- **Transitional care management (TCM)** — workflow for CPT 99495/99496 billing after hospital discharge

#### Patient engagement
- **Patient portal** — schedule, message, view results, pay bills, request refills; WCAG 2.1 AA compliant
- **Automated reminders** — appointment reminders via SMS/email/phone with patient-preferred channel selection
- **Digital intake forms** — sent 24–48 hours before visit; auto-populates chart on completion
- **Telehealth / video visits** — embedded HIPAA-compliant video with waiting room, in-session documentation, billing integration
- **Patient satisfaction surveys** — post-visit CAHPS-aligned surveys with dashboard reporting

#### AI and ambient documentation (the 2025 battleground)

71% of physician practice leaders now use AI for patient visits. Burnout fell from 51.9% to 38.8% in a 30-day ambient AI study (263 physicians):

| Feature | DAX Copilot | Abridge | Suki | Nabla |
|---------|------------|---------|------|-------|
| **Monthly cost/provider** | $600–800 | ~$199 | $299–399 | $119 (Pro) |
| **Note completion speed** | Not published | Not published | **72% faster** | Not published |
| **Languages** | Limited | 28 | 80+ | 35+ |
| **Key strength** | Deepest Epic integration | Linked Evidence audit trail | Broadest voice command set | No server-side data storage |
| **Best for** | Enterprise Epic shops | Auditable billing-optimized notes | Voice workflow + coding | Privacy-first, budget |

**Recommendation**: Build a native lightweight ambient layer (browser-based audio → SOAP note draft) and partner with Suki or Nabla for enterprise-grade capability. **athenaAmbient** is a model to study — included free in athenahealth subscriptions.

---

## Section 2: Pain points by role — what each user suffers daily

### Physicians and providers (MD, DO, NP, PA)

- **Time burden**: 5.8 EHR hours per 8 patient-hours; 36.2 minutes of EHR work per 30-minute visit; 22.5% spend 8+ hours/week on after-hours documentation ("pajama time")
- **Alert fatigue**: Median 63 alerts/day; 86.9% report alert burden as excessive; 96% of pop-up alerts are overridden without action
- **Click fatigue**: Emergency physicians average ~4,000 clicks per 10-hour shift; every additional click correlates with reduced patient face time
- **Inbox overload**: Unmanaged message pools, lab result notifications, prior auth requests, refill requests all competing in one inbox
- **Information fragmentation**: 70% of physicians report difficulty finding needed information; "chart-digging" — clicking across tabs to reconstruct patient history
- **Inflexible templates**: Templates designed for billing compliance, not clinical reasoning; forcing unnecessary structured fields during time-sensitive visits
- **Poor search**: Cannot search within a patient's chart efficiently; have to navigate by tab/section
- **90% of PCPs** say EHRs need to be more intuitive; **72%** believe better UI would most reduce EHR burden (AMA)

### Nurses and medical assistants

- Spend **35% of shifts (3.5 hours)** on documentation
- Switch EHR tasks **1.4 times per minute** — accounting for ~80% of documentation errors
- Vital signs entry requires navigating to a separate screen in most EHRs
- **98% of RNs** were never included in hospital IT decisions or EHR design
- MA-specific frustrations: manual insurance verification steps, lack of pre-visit prep automation, rooming workflows buried in menus
- Medication administration workflows too long; too many confirmation screens for routine tasks

### Billing and revenue cycle staff

- Claim denial rates reached **11.81% in 2024**, with 73% of billing staff reporting increases year-over-year
- Administrative cost per denied claim: **$57.23** in 2023
- Prior authorization consumes an average of **13 hours per physician per week** across the practice
- Only **3% of organizations** feel entirely successful integrating revenue cycle with clinical operations
- Top billing frustrations: unclear denial reasons, lack of real-time eligibility verification, manual charge capture, no denial prediction
- More than **1 in 5 providers loses $500K+ annually** from claim denials

### Front desk and scheduling staff

- Handle **12–200 calls daily** depending on practice size
- Complex scheduling interfaces with poor visual calendars
- Insurance eligibility must be manually verified before each visit — a 3–5 minute process per patient without automation
- Disconnected systems: scheduling in one module, registration in another, check-in in a third
- No-show rates as high as 20–30% without automated reminders

### Practice administrators

- Lack of real-time operational dashboards — must pull reports manually to answer basic questions
- User management and role configuration buried in admin panels
- Audit trail access difficult — compliance teams often need IT involvement to pull logs
- Staff training on complex EHRs takes 2–6 weeks; turnover resets training cost repeatedly

### Patients (portal experience)

- **32%** cite sign-up difficulty as the primary barrier to portal adoption
- Test results available in portal before provider has reviewed — causes patient anxiety without context
- Bill pay and clinical records on separate platforms
- Mobile portal experience far inferior to desktop in most systems
- After-visit summaries too clinical; not written in patient-friendly language

---

## Section 3: Single-screen design and speed-first workflow patterns

### The fastest EHRs — what makes them different

**Five validated screen design principles** from academic research:
1. Display single-patient data per view — no multi-patient confusion
2. Summarize data with details-on-demand — collapsed cards that expand inline
3. Show time-series trends — lab values with sparklines, not just latest value
4. Categorize by clinical type — problems separate from medications separate from orders
5. Maximize simultaneous data display — more information density, fewer page loads

**Elation Health's cockpit view** is the speed benchmark: a 3-pane console with patient history left, current note center, actions panel right. Only **2 screens to learn** in the entire system. Providers chart, prescribe, and order labs from the same view. Single-click data pulls from prior visits. Best in KLAS two consecutive years.

**ModMed's Adaptive Learning Engine** observes individual charting habits, pre-selects the next likely action, and delivers a "virtually keyboardless" experience. Tap-and-go notes. Auto-suggested ICD-10/CPT codes. South Palm Orthopedics saves **2 hours per day** per provider.

### Click reduction — it has quantifiable ROI

- Emory Healthcare optimization initiative: **36% reduction in after-hours EHR use**, one-third fewer clicks across 37 departments and 1,650 providers
- Scripps Health "click wheel" visualization: **23 percentage-point increase** in providers agreeing their EHR enables efficiency
- Target: **3 clicks or fewer** for any common clinical action

| Action | Target clicks |
|--------|--------------|
| Open patient chart from schedule | 1 |
| Start new visit note (auto-populated) | 1 |
| Order a common lab panel (favorite) | 2 |
| Prescribe a refill from med list | 1 |
| Sign and close encounter | 1 |
| Check insurance eligibility | 1 |
| Send portal message | 2 |
| Generate billing claim | 0 (auto from note) |

### The command palette — highest-impact single feature

Borrowed from VS Code, Figma, and Linear, the **command palette (Ctrl+K)** is a searchable overlay that consolidates navigation, actions, and search into a single keyboard-triggered interface. Clinical examples:
- Type `john sm` → jump to John Smith's chart (fuzzy matching)
- Type `new rx` → open prescribing panel
- Type `a1c` → view A1c trend for current patient
- Type `ref` → create a referral
- Type `?` → show all available shortcuts

Fuzzy search handles typos. Recent commands appear before the user types. Shortcut hints display inline next to every action. **No major EHR has implemented this yet** — this is a genuine first-mover opportunity.

### Dashboard design for primary care

Research shows more than 4 dashboard widgets causes visual clutter and a 40%+ slowdown in data retrieval. The primary care dashboard needs exactly these panels:

1. **Today's schedule** — appointment list with pre-visit prep flags (missing labs, incomplete intake, outstanding balance, care gaps due)
2. **Priority inbox** — unified view of labs to review, messages, prior auth requests, refill requests — sortable by urgency
3. **Care gaps panel** — patients due for screenings, vaccinations, chronic disease follow-up; filterable by measure (HEDIS, MIPS)
4. **Key metrics strip** — today's appointment count, pending orders, unsigned notes, denial rate (for admins)

### Patient chart as the command center

The patient chart is where 80% of clinical time is spent. Layout requirements:

**Sticky header (always visible, never scrolls)**
- Patient photo, name, DOB, age, sex, MRN
- Active allergies as red pill badges
- Insurance status + verification date
- Risk flags (high-risk, care gaps, outstanding balance)
- Action buttons: `New Note` · `New Order` · `Prescribe` · `Message` — with keyboard shortcuts visible on hover

**Left panel — single-key chart navigation (320px, fixed)**

| Key | Section |
|-----|---------|
| `S` | Summary |
| `E` | Encounters / Visit History |
| `M` | Medications |
| `P` | Problem List |
| `O` | Orders |
| `V` | Vitals (with trend chart) |
| `L` | Labs / Results |
| `I` | Immunizations |
| `R` | Referrals |
| `B` | Billing / Claims |

**Right panel — content with inline expansion**
- Clicking a lab result or note expands it in-place — never a new page
- All critical summary data visible above the fold on a 1080p display without scrolling

**Summary view — the most-used screen**
- 4 always-expanded cards: Active Problems · Current Medications · Allergies · Recent Vitals (with trend arrows)
- Clinical timeline filterable by type (labs, visits, orders, referrals, messages)
- Sparkline charts for key longitudinal values (A1c, BP, BMI, eGFR)
- Care gap alerts surfaced inline — not a separate tab

---

## Section 4: Compliance requirements (2024–2026)

### Critical regulatory deadlines converging in 2026

| Deadline | Requirement | What the EHR must build |
|----------|------------|------------------------|
| **Jan 1, 2026** | USCDI v3 mandatory (ONC HTI-1) | Updated FHIR resource support, new data elements |
| **Jan 1, 2026** | CMS-0057-F Phase 1 — PA process requirements | PA status in patient record, provider notifications |
| **Jan 1, 2026** | SMART App Launch IG v2.0 | Updated OAuth2 / PKCE authentication |
| **May 11, 2026** | WCAG 2.1 Level AA — HHS rule for patient-facing apps | Portal, kiosk, telehealth UI accessibility |
| **Jan 1, 2027** | CMS-0057-F Phase 2 — FHIR PA APIs mandatory | Prior Auth API (DaVinci PAS), Provider Access API |
| **Late 2025/2026** | HIPAA Security Rule NPRM finalization | MFA, encryption, pen testing, asset inventory |

### HIPAA Security Rule — proposed 2025 requirements

The proposed rule (published January 6, 2025) eliminates the "addressable vs. required" distinction. **All of the following become mandatory**:
- Multi-factor authentication for all workforce members
- Encryption of ePHI at rest (AES-256) and in transit (TLS 1.2+)
- Network segmentation isolating clinical systems
- Vulnerability scanning every 6 months
- Penetration testing every 12 months
- Written technology asset inventory updated annually
- Annual compliance audits with documented results
- Estimated industry compliance cost: **$34 billion over 5 years**

### ONC 21st Century Cures Act / HTI-1

- **Information blocking penalties**: up to $1 million per violation
- Required: FHIR R4 APIs per US Core IG v6.1.0 (USCDI v3), open patient and population access endpoints
- Required: C-CDA generation and exchange for transitions of care
- Required: SMART on FHIR App Launch v2.0 by December 31, 2025
- Required: Decision Support Intervention (DSI) transparency — algorithms must disclose data sources and logic
- **HTI-4 (August 2025)** adds: electronic prior authorization criteria, updated e-prescribing certification, and Real-Time Prescription Benefit certification

### Accessibility — WCAG 2.1 Level AA (HHS 2024 Rule)

Patient-facing components (portal, telehealth, kiosks, intake forms) must meet WCAG 2.1 AA by **May 11, 2026**. Requirements include:
- Screen reader compatibility (ARIA landmarks, alt text, focus management)
- Keyboard navigability for all interactive elements
- Minimum 4.5:1 color contrast ratio for normal text, 3:1 for large text
- Captions on all video content
- No content that flashes more than 3 times per second
- Non-compliance risks: loss of federal funding, litigation under Section 504/ADA

### TEFCA — live as of 2024

- 11 QHINs designated, including Epic Nexus, eHealth Exchange, Oracle Health, and Kno2
- By January 1, 2026: all exchanged data must conform to USCDI v3
- New EHRs should pursue **QHIN subparticipation** (via Kno2 or eHealth Exchange) — fastest path to nationwide connectivity without becoming a QHIN directly

### Prior authorization — CMS-0057-F

- **Phase 1 (Jan 1, 2026)**: Payers must provide real-time eligibility and PA decisions; EHRs must capture PA status in patient records
- **Phase 2 (Jan 1, 2027)**: Payers must expose FHIR-based Prior Authorization API; EHRs must initiate PA electronically via DaVinci PAS IG
- **Impact on primary care**: 13 physician hours/week consumed by PA; automating this is a top ROI feature

### Additional compliance requirements

- **Promoting Interoperability (PI) / MIPS**: Required for Medicare providers; EHR must support eCQM calculation, e-Prescribing, HIE participation, and patient portal metrics
- **EPCS**: DEA-compliant two-factor controlled substance e-prescribing; mandated in 35+ states; requires Drummond Group third-party audit
- **PCI DSS v4.0**: Required if EHR processes credit card payments directly; scope can be reduced via tokenized payment processor (Stripe, Square Health)
- **SOC 2 Type II / HITRUST CSF**: De facto requirement for enterprise sales; major payers require HITRUST from downstream vendors
- **PDMP**: Most states require PDMP query before dispensing Schedule II–IV; must be embedded in prescribing workflow — no separate login

---

## Section 5: Revenue model and market economics

### Market size

- **US EHR market**: $12.87 billion in 2024; projected CAGR of 4.3–5.6% through 2030–2033
- **Cloud-based segment**: 83–84% of revenue; fastest growing
- **Global market**: $28–36 billion (2024), projected $44–53 billion by 2033–2035

### Top vendor revenues

| Vendor | 2024 Revenue | Primary Pricing Model |
|--------|-------------|----------------------|
| Epic | $5.7B | Enterprise license + module fees |
| Oracle Health | ~$5.3B | Enterprise license |
| athenahealth | ~$1.4B | 4–7% of collections |
| eClinicalWorks | ~$800M | $449/provider/month |
| NextGen | ~$600M | Per-provider subscription |
| Kareo / Tebra | ~$200M | $110–300/provider/month |

### Pricing models and what drives upsell

**Three dominant models**:
1. **Per-provider/month subscription** — $100–600 ambulatory average; most predictable for customers
2. **Percentage of collections** — 2.9–7% (athenahealth, eClinicalWorks RCM); aligns vendor incentive with practice revenue
3. **Enterprise licensing** — $1M–$30M+ for hospital-grade Epic deployments

**Revenue Cycle Management is the single most profitable module** — priced at 2.9–7% of total collections on a recurring basis, representing 40–60% of total platform revenue for most mid-market EHRs:

| Module | Typical Pricing | Upsell Value |
|--------|----------------|-------------|
| RCM / billing services | 2.9–7% of collections | Very high — recurring |
| AI ambient documentation | $99–399/provider/month | High — sticky |
| Patient engagement | $50–150/provider/month | Medium |
| Telehealth | $50–200/provider/month | Medium |
| Population health / analytics | $100–300/provider/month | High for VBC |
| Electronic prior authorization | $50–150/provider/month | High — saves staff time |

### Primary care RCM specifics

- Practices using **integrated EHR + PM + RCM** collect **29% more** on billed charges than non-integrated approaches
- Clean claim rate target: **>95%** (industry average: 85%)
- First-pass acceptance rate target: **>98%**
- Days in AR target: **<30** for primary care (industry average: 40–50 days)
- Highest-denial primary care CPT codes: 99213/99214 (underdocumented E&M), AWV (missing G-code justification), preventive services (diagnosis mismatch)

---

## Section 6: Feature priority matrix

### Must-have features — cannot launch without

| Category | Specific Features |
|----------|-----------------|
| **Clinical Documentation** | SOAP note templates, smart phrases/macros, copy-forward with review, free-text + structured hybrid, e-signing, auto-populated header (meds, allergies, problems) |
| **Scheduling** | Multi-provider/room/location calendar, appointment types with custom durations, wait-list management, color-coded by appointment type |
| **Patient Intake** | Digital intake forms (sent pre-visit), auto-population into chart, insurance card capture, consent forms |
| **Orders** | Lab ordering (Quest/LabCorp), imaging orders, referral orders with tracking |
| **e-Prescribing** | Surescripts NewRx + refills + EPCS, drug-drug/drug-allergy checks, formulary check, PDMP integration |
| **Billing / RCM** | 837P claim generation, eligibility verification (270/271), ERA processing (835), CPT/ICD-10 coding assistance, claim scrubbing |
| **Patient Portal** | ONC-certified VDT (View/Download/Transmit), secure messaging, appointment self-scheduling, test result access, WCAG 2.1 AA |
| **Interoperability** | FHIR R4 APIs (ONC §170.315(g)(10)), USCDI v3, C-CDA, Direct messaging |
| **Telehealth** | HIPAA-compliant video, waiting room, in-session charting, billing integration |
| **Security** | MFA, AES-256 at rest + TLS 1.2+ in transit, RBAC, audit logging, session timeout, SOC 2 Type II |

### Should-have features — strong differentiators

| Category | Specific Features |
|----------|-----------------|
| **Speed / UX** | Command palette (Ctrl+K), 3-tier keyboard shortcut system, single-screen patient chart, adaptive favorites, context-aware UI |
| **AI Documentation** | Native ambient layer or embedded partner (Suki/Nabla), smart phrase suggestions, AI-assisted CPT/ICD-10 coding, pre-visit AI summaries |
| **Primary Care Workflow** | Care gap alerts (in-visit, not on chart open), AWV workflow, chronic disease dashboards, HEDIS tracking, HCC coding suggestions |
| **RCM Intelligence** | Real-time benefit check (RTBC), electronic prior authorization, denial prediction, automated reminders for outstanding AR |
| **Population Health** | Panel management dashboard, risk stratification, outreach campaign tools, MIPS quality measure tracking |
| **Referral Management** | Outbound referral with specialty directory, tracking workflow, closed-loop return note integration |
| **Care Coordination** | TEFCA connectivity, TCM billing workflow (CPT 99495/99496), CCM billing module (CPT 99490), care plan builder |
| **Patient Engagement** | Automated appointment reminders (SMS/email), post-visit satisfaction surveys, broadcast messaging for recalls |

### Nice-to-have features — future roadmap

- Remote Patient Monitoring (RPM) integration with automated billing (CPT 99454/99457)
- SMART on FHIR app marketplace
- SDOH screening + community resource referrals (findhelp / Unite Us)
- Advanced population health with predictive risk modeling
- Bulk FHIR data export for payer and quality program submission
- Patient reputation management (Google/Healthgrades review prompts)
- Chronic Care Management (CCM) full workflow automation
- Group visit documentation support

### Features to avoid building — known anti-patterns

| Anti-pattern | Why it fails |
|-------------|-------------|
| **Excessive interruptive alerts** | 96% are overridden; causes alert fatigue; use tiered system instead |
| **One interface for all roles** | Nurses, providers, billers have fundamentally different workflows; role-based views are mandatory |
| **Mouse-only interactions** | Any task requiring 3+ clicks without a keyboard alternative drives adoption failure |
| **Rigid templates without free-text override** | Clinicians reject systems forcing inflexible documentation structures |
| **Tab-heavy deep navigation** | Legacy EHRs bury information 3+ tabs deep; use progressive disclosure instead |
| **Alerts firing on chart open** | Fire contextual alerts during relevant clinical actions, not on every chart view |
| **Separate login for PDMP** | Integration must be in-workflow; separate portal kills adoption |
| **Billing as a separate application** | Disconnected billing systems cause 29% lower collection rates |

---

## Section 7: UX and UI design specifications

### Navigation architecture

**Left sidebar** (persistent, 64px collapsed / 240px expanded):
- 7 primary sections: Dashboard · Schedule · Patients · Inbox · Tasks · Reports · Settings
- Keyboard mapped: Ctrl+1 through Ctrl+6
- Background: `#1A1F36` (dark navy); active item: 3px left accent border in `#4F8FF7`
- No nested dropdowns — all sections are flat single destinations

**Command palette (Ctrl+K)** — the highest-priority UX investment:
- Centered modal, 560px wide, auto-focused input on trigger
- Fuzzy search with categorized results: Patients / Actions / Navigation / Recent
- Inline keyboard shortcut hints next to every result
- Recent commands appear before typing begins
- Dismiss: Escape; navigate: arrow keys; select: Enter

**Patient chart tabs** (max 5 open, browser-tab style):
- Ctrl+Tab to cycle between open patients
- Each tab: patient name + DOB + color-coded risk indicator on left edge
- Middle-click or × to close; Ctrl+W to close current

### Patient chart layout — detailed specification

**Sticky header (64px, always visible)**
```
[Photo] [Name, DOB, Age] [MRN]  |  [⚠ NKDA] [Insurance: Verified ✓]  |  [New Note N] [Prescribe R] [Order O] [Message G]
```
- Allergies: red pill badges — clicking expands full allergy list inline
- Risk flag badges: High Risk · Care Gaps · Outstanding Balance
- All action buttons show keyboard shortcut on hover

**Left panel — chart navigation (320px fixed)**

| Key | Section | Content |
|-----|---------|---------|
| `S` | Summary | Problems, Meds, Allergies, Vitals, Sparklines |
| `E` | Encounters | Visit history with note previews |
| `M` | Medications | Active list with RTBC status |
| `P` | Problems | Active + resolved ICD-10 coded list |
| `O` | Orders | Pending + completed orders |
| `V` | Vitals | Trends for BP, HR, weight, BMI, O2 |
| `L` | Labs | Results with reference ranges + trend |
| `I` | Immunizations | History + due dates + registry sync |
| `R` | Referrals | Outbound tracking + return notes |
| `B` | Billing | Claim status, ERA, outstanding balance |

**Summary view — critical first view**
- 4 always-expanded summary cards: Active Problems · Medications · Allergies · Recent Vitals with trend arrows
- Clinical timeline below cards — filterable by type (labs / visits / orders / referrals)
- Sparklines for key longitudinal values: A1c, BP (systolic trend), BMI, eGFR
- Care gap alerts inline in Summary — surfaced contextually, never as a separate navigation step
- All of this visible above the fold at 1080p without scrolling

### Visit note layout — single-screen documentation

```
[Visit Note — Jane Smith — 03/18/2026 — Est. Patient Visit]
─────────────────────────────────────────────────────────────
Chief Complaint    [auto-pulled from intake form]
HPI                [free-text with smart phrase expansion]
ROS                [tap-to-select structured + free-text]
Exam               [configurable by provider]
Assessment & Plan  [ICD-10 inline, order/Rx buttons embedded]
─────────────────────────────────────────────────────────────
[Billing: auto-suggested E&M level]  [Sign + Close ↵]
```

- All sections on one scrollable page — no tab switching during documentation
- Prescribing opens as a right-side panel without navigating away
- Lab ordering is inline within Assessment & Plan — type test name, one click to order
- Billing E&M level auto-suggested from documentation; provider confirms or adjusts
- Sign button triggers final review → claim generation → portal release (configurable)

### Keyboard shortcut map — three tiers

**Tier 1 — Global (always active)**

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Command palette |
| `Ctrl+N` | New note for current patient |
| `Ctrl+P` | Patient search |
| `Ctrl+Enter` | Sign / submit current form |
| `Ctrl+/` | Show shortcut reference overlay |
| `Ctrl+.` | Open notification center |
| `Ctrl+1–6` | Navigate to sidebar sections |
| `Ctrl+Tab` | Cycle open patient tabs |

**Tier 2 — Chart context (active when not in a text input)**

| Key | Action |
|-----|--------|
| `S E M P O V L I R B` | Navigate chart sections |
| `N` | New note |
| `R` | New prescription |
| `O` | New order |
| `G` | Send message |
| `F` | Find within patient chart |

**Tier 3 — Within forms**

| Shortcut | Action |
|----------|--------|
| `Tab / Shift+Tab` | Navigate fields |
| `.` prefix | Expand smart phrase |
| `Alt+1–9` | Select from numbered list |
| `Ctrl+C` | Copy-forward previous value |
| `↑ ↓` | Navigate dropdown options |

**Discoverability**: Every button tooltip shows its shortcut. After a user clicks the same button 3+ times, a contextual nudge appears: *"Pro tip: Press N to create a note faster."*

### Color coding and visual hierarchy

**Clinical severity palette (WCAG AA compliant)**:
- Critical: `#DC2626` (red) — always paired with ● icon
- Warning: `#D97706` (amber) — always paired with ▲ icon
- Success / Normal: `#059669` (green) — ■ icon
- Informational: `#2563EB` (blue) — ℹ icon
- Neutral: `#6B7280` (gray) — for inactive / historical items

**Typography**:
- Base font: Inter 14px for clinical data density
- Monospace (JetBrains Mono): MRNs, DOBs, lab values, medication dosages — prevents misread errors
- Line height: 1.5 for readability during extended shifts

**Never rely on color alone** — always pair color with shape and label for accessibility.

### Alert design — defeating alert fatigue

Cleveland Clinic reduced enterprise alerts by **75% in one year** through tiered alert design:

| Tier | Type | Trigger | Daily target |
|------|------|---------|-------------|
| 1 | Interruptive modal | Life-threatening: critical drug interaction, lethal lab value | < 5/provider/day |
| 2 | Persistent banner | Abnormal result requiring action within 24h | < 15/provider/day |
| 3 | Inline contextual badge | Care gap, overdue test — shown during relevant clinical action only | In-context only |
| 4 | Notification center | Everything else (FYI messages, non-urgent updates) | Batched, async |

Smart suppression: deduplicate within 24 hours, track override patterns for pharmacy review, fire care gap alerts only during relevant encounter type.

### Dark mode and long-shift considerations

- Offer dark mode as user preference; never forced on
- Dark mode: `#0D1117` background (not pure black), `#E6EDF3` text (not pure white)
- Maintain WCAG AA contrast in both light and dark modes
- Additional: adjustable font size (Ctrl+=/-), reduced motion toggle, optional warm color temperature after 8 PM, 20-20-20 rule reminder toast (dismissible)

---

## Section 8: Integration ecosystem and implementation timeline

### Phase 1 — launch-blocking integrations (Months 1–6)

**e-Prescribing: Surescripts**
- Certification required: NCPDP SCRIPT 2017071 for NewRx, refills, cancel, change, fill notifications
- EPCS: DEA-compliant two-factor; Drummond Group third-party audit required; 35+ states mandate
- PDMP: Bamboo Health (RxCheck) embedded in Rx workflow — no separate login

**Lab interfaces: HL7 V2 bidirectional**
- Quest Diagnostics + LabCorp: HL7 V2 ORM (orders) + ORU (results); used by 95%+ of organizations
- Health Gorilla Diagnostic Network API: single FHIR-based integration to Quest, LabCorp, and 9,000+ labs — recommended for faster launch
- LOINC coding for all lab results (mandatory under USCDI v3)

**Claims clearinghouse: X12 EDI**
- **Availity**: widest payer connectivity; 13B+ transactions/year; free basic tier
- **Waystar**: AI-driven denial prediction; Best in KLAS RCM
- Support: 837P (professional claims), 270/271 (eligibility), 835 (ERA), 276/277 (claim status)

**FHIR R4 APIs — ONC certification (§170.315(g)(10))**

Required FHIR resources: Patient, AllergyIntolerance, Condition, MedicationRequest, Observation (labs + vitals), Immunization, Encounter, CareTeam, Goal, CarePlan, Provenance, DocumentReference

- US Core IG v6.1.0 (USCDI v3 compliance by Jan 1, 2026)
- SMART App Launch v2.0 with PKCE
- Bulk Data Access (FHIR $export) for population-level queries

**Immunization registries**
- HL7 V2.5.1 VXU (vaccination update) + VXR (query response)
- Bidirectional: submit immunizations administered + query patient history from state registry

### Phase 2 — competitive differentiators (Months 6–12)

- **TEFCA / QHIN subparticipation** via Kno2 or eHealth Exchange — enables nationwide patient record retrieval
- **Electronic prior authorization** — DaVinci PAS IG; auto-attach clinical documentation from note; show PA status inline in medication and referral workflows
- **Real-Time Benefit Check (RTBC)** — Surescripts certification; shows patient's exact copay + lowest-cost alternatives at prescribing time; reduces pharmacy callbacks ~40%
- **Telehealth integration** — Twilio Video SDK ($0.004/participant/minute) or Zoom for Healthcare; session auto-creates encounter note with modifier 95 pre-populated
- **Patient engagement platform** — Phreesia (1 in 7 US visits) or Luma Health (AI-native, 1,000+ health systems)

### Phase 3 — future ecosystem (Months 12–18)

- **Remote Patient Monitoring (RPM)**: devices → FHIR Observation → automated CPT 99454/99457 billing
- **SMART on FHIR app marketplace**: third-party specialty apps with patient context launch within the EHR
- **SDOH screening + referrals**: PRAPARE tool + Unite Us / findhelp API for community resource referral and closed-loop tracking
- **Payer Provider Access API**: FHIR endpoint for payers to share patient attribution and prior care data (CMS-0057-F Phase 2)
- **Bulk FHIR export**: for payer quality program submission and population health analysis

### Integration implementation summary

| Phase | Months | Key Integrations |
|-------|--------|-----------------|
| **Phase 1** | 1–6 | ONC FHIR certification, Surescripts Rx + EPCS, clearinghouse (Availity/Waystar), Quest/LabCorp, patient portal VDT, immunization registry |
| **Phase 2** | 6–12 | TEFCA/QHIN, telehealth, PDMP, RTBC, patient engagement platform, electronic prior auth |
| **Phase 3** | 12–18 | RPM devices, SMART app ecosystem, SDOH referrals, bulk FHIR export, payer Provider Access API |

---

## Conclusion: The design philosophy that wins

Research across the top 100 EHR systems converges on a clear thesis: **the winning EHR is not the one with the most features — it is the one that eliminates friction from the 20 tasks clinicians perform hundreds of times daily.**

Elation Health proved this with just 2 screens. ModMed proved it with adaptive learning. Epic proved it by winning 70% of new contracts through workflow depth.

**Three architectural bets matter most for a new primary care EHR**:

1. **Command palette + keyboard-first navigation** borrowed from developer tools — this alone can cut the 4,000-click daily burden by 30–50% and is completely absent from every major EHR today

2. **Role-aware and context-aware UI** that shows nurses rooming workflows, providers care gaps and coding suggestions, and billing staff denial queues — without manual configuration per user

3. **Ambient AI documentation as a core feature at launch, not an add-on** — 71% of physicians already use AI for visits; building this in creates immediate differentiation at a price point legacy systems charge $600–800/month for separately

The compliance timeline is unforgiving: USCDI v3, SMART App Launch v2, WCAG 2.1 AA, and CMS-0057-F Phase 1 all converge in 2026. Building to these standards from day one avoids the technical debt that cripples legacy systems and blocks market entry in a heavily regulated space.

The $12.9 billion market opportunity is real — but the real unlock is the **62% of physicians who blame their EHR for burnout**. A system that saves even one hour per day generates referral-driven organic growth that no sales team can match.
