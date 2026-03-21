# Product Requirements Document — Primus EHR

**Product:** Primus  
**Company:** Thinkitive Technologies  
**Version:** 1.0  
**Date:** March 2026  
**Status:** Active — UI phase in progress

---

## Executive Summary

Primus is a multi-tenant SaaS EHR (Electronic Health Record) platform purpose-built for primary care clinics in the USA. It replaces fragmented, slow, click-heavy legacy EHRs (legacy EHR, Athenahealth, eClinicalWorks) with a single-screen, keyboard-first clinical experience that eliminates the "pajama time" epidemic — the 22.5% of physicians who spend 8+ hours per week on EHR work after clinic hours.

**The core insight:** The $12.9B US EHR market is dominated by systems that score in the bottom 9% of all technologies for usability. 62% of burned-out clinicians blame their EHR. A product that saves even one hour per day generates referral-driven adoption that no sales team can match.

**Initial client:** Primus Demo Clinic (3–4 clinic locations) — migrating from legacy EHR systems.  
**SaaS expansion:** Multi-tenant platform serving 50+ primary care practices.

---

## Problem Statement

Primary care physicians face a documentation crisis:
- **36.2 minutes** of EHR work per 30-minute patient visit
- **5.8 hours** on EHR for every 8 hours of scheduled patient time
- **4,000+ clicks** per 10-hour shift
- **63 alerts per day** — 96% dismissed without reading
- Constant navigation between screens to complete a single task

The result: physician burnout, reduced time with patients, and a $120K+ annual cost to practices from documentation inefficiency alone.

---

## Product Goals

1. **Reduce documentation time by 50%** — target < 18 minutes of EHR work per 30-minute visit
2. **Zero-tab clinical workflow** — complete 90% of tasks from the patient chart without navigating away
3. **3-click maximum** for any common clinical action
4. **Keyboard-first** — every action accessible without a mouse
5. **Role-aware UI** — every role sees exactly what they need, nothing more
6. **HIPAA compliant + production-ready** from day one
7. **Multi-tenant SaaS** — onboard a new clinic in under 30 minutes

---

## Target Users

| Role | Count per typical clinic | Priority |
|------|-------------------------|----------|
| Provider (MD/NP/PA) | 3–8 | P0 — primary user |
| Nurse / MA | 4–10 | P0 — daily heavy user |
| Front Desk | 2–4 | P0 — patient-facing |
| Billing Staff | 1–3 | P1 — revenue critical |
| Practice Admin | 1–2 | P1 — operational |
| Tenant Admin | 1 | P1 — setup and oversight |
| Patient | All patients | P1 — portal engagement |
| Super Admin | Thinkitive staff | P0 — platform management |

Full persona details: `docs/product/user-personas.md`

---

## Key Features (Summary)

### Provider-focused (highest ROI)

1. **Single-screen patient chart** — problems, meds, allergies, vitals, timeline all visible at once without scrolling on 1080p
2. **Command palette (Ctrl+K)** — search patients, trigger any action, navigate anywhere — no mouse required
3. **Inline note signing** — Ctrl+Enter to sign, auto-generates charges, no extra steps
4. **Embedded prescribing** — Rx panel opens as right sidebar; never navigates away from chart
5. **Inline lab ordering** — order from within Assessment & Plan section, one click
6. **Smart phrase expansion** — type `.hpi` to expand full templates
7. **E&M auto-suggestion** — billing code suggested from documentation; provider confirms
8. **Priority inbox** — critical labs first, then PA requests, then messages, then FYI — not a flat pile

### Operational (practice efficiency)

9. **Drag-and-drop scheduling calendar** with multi-provider view and room status board
10. **One-click insurance eligibility** — 270/271 in real-time at check-in
11. **Guided rooming checklist** — MA can't skip steps; one-click provider notification
12. **Real-time room status board** — everyone knows where every patient is

### Revenue (billing and RCM)

13. **Plain-language denial reasons** with suggested correction action
14. **Auto-ERA matching** — payments matched to claims automatically; exceptions for review only
15. **Real-time billing KPI dashboard** — clean claim rate, denial rate, days in AR (no export needed)
16. **Good Faith Estimate** — No Surprises Act compliance built in

### Patient engagement

17. **Mobile-first patient portal** — works on iPhone SE (375px)
18. **One-button telehealth join** — no complexity for patients
19. **Lab results with context** — provider's note shown before raw values
20. **Embedded bill pay** — one login, one place for everything

Full feature list with P0/P1/P2 priorities: `docs/product/feature-map.md`

---

## Non-Functional Requirements

### Performance
- Page load: < 2 seconds for all pages (cached data)
- Patient chart load: < 1 second (critical path for clinical workflow)
- API response: P99 < 500ms for all clinical read operations
- API response: P99 < 2 seconds for all write operations
- Real-time eligibility check: < 3 seconds

### Availability
- Production uptime: 99.9% (< 8.7 hours downtime/year)
- Maintenance windows: Tuesday 2–4 AM EST only
- RPO: 5 minutes (Aurora continuous backup)
- RTO: 1 hour (Multi-AZ failover)

### Security and compliance
- HIPAA Security Rule: full compliance (BAA with all vendors)
- SOC 2 Type II: Target Phase 10 (required for enterprise sales)
- MFA: Required for all clinical staff
- Audit log: 7-year retention (CloudTrail + application audit log)
- Encryption: AES-256 at rest, TLS 1.2+ in transit
- No PHI in emails or SMS — notification-only with portal link
- Geo-restriction: US only + Thinkitive IP allowlist

### Accessibility
- Patient portal: WCAG 2.1 Level AA (legal requirement by May 11, 2026)
- Provider portal: WCAG 2.1 Level AA recommended

### Browser support
- Chrome 120+ (primary)
- Firefox 120+
- Safari 17+ (for iPad clinical use)
- Edge 120+
- Mobile Safari / Chrome Mobile (patient portal)

---

## Out of Scope (Version 1.0)

- Inpatient / hospital-grade workflows (ICU, OR scheduling, inpatient orders)
- Dental, veterinary, or specialty-specific modules beyond primary care
- FHIR R4 public APIs (Phase 10)
- Mobile native apps (iOS/Android) for provider portal — responsive web only
- AI ambient documentation (Phase 3 or later — partnership with Suki/Nabla)
- Prior authorization FHIR APIs (DaVinci PAS) — Phase 10 (CMS mandate Jan 2027)
- TEFCA participation — Phase 10

---

## Development Approach

**Phase 0 — UI First:**
Build a complete React simulation of all screens and flows with mock data. Iterate until design is finalized. No backend required in this phase.

**Rationale for UI-first:**
- Discover UX problems before building expensive backend
- Get stakeholder feedback on real, interactive screens (not static mockups)
- Define the exact data contracts the UI needs → drives API design
- Faster iteration cycle: 1 hour vs 1 day to change a flow

**Phase 1+ — Backend, phase by phase:**
Each backend phase is feature-complete before the next starts. No parallel development until Phase 3+.

Full phase plan: `CLAUDE.md`

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Documentation time per visit | < 18 min (from 36+) | Timed observation sessions |
| Provider NPS | > 50 | In-app survey monthly |
| Claim clean rate | > 95% | Billing dashboard |
| Days in AR | < 30 | Billing dashboard |
| Patient portal activation | > 60% of active patients | Analytics |
| Support tickets per provider per week | < 1 | Zendesk/support |
| Physician after-hours EHR time | < 30 min/day | Self-reported survey |

---

## Competitive Differentiation

| Feature | Primus | Epic | Athenahealth | legacy EHR |
|---------|--------|------|-------------|---------|
| Command palette (Ctrl+K) | ✅ | ❌ | ❌ | ❌ |
| Single-screen patient chart | ✅ | ❌ (multi-tab) | ❌ | Partial |
| Inline Rx (no navigation) | ✅ | ❌ | ❌ | ❌ |
| Inline lab ordering in A&P | ✅ | ❌ | ❌ | ❌ |
| Role-aware dashboard per role | ✅ | ❌ | Partial | ❌ |
| E&M auto-suggestion | ✅ | Partial | Partial | ❌ |
| Plain-language denial reasons | ✅ | ❌ | ❌ | ❌ |
| Multi-tenant SaaS | ✅ | ❌ | ✅ | ✅ |
| Modern tech stack (React/Java 21) | ✅ | ❌ | Partial | ❌ |
| Starting cost | $TBD | $1M+ | 4-7% collections | ~$500/mo |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Scope creep during UI phase | High | Medium | Strict P0/P1/P2 framework; sign-off before next phase |
| HIPAA compliance gaps | Medium | Critical | Compliance review at each phase gate |
| Integration delays (ScriptSure DEA audit) | High | Medium | Start EPCS certification process in Phase 4 |
| Keycloak complexity in multi-tenant | Medium | High | Proven pattern from Primus Demo Clinic |
| Over-engineering early | Medium | Medium | Monolith-first rule; no microservices until needed |
| Change Healthcare/Availity outage risk | Medium | High | Dual clearinghouse option (Waystar as backup) |

---

## Document Index

| Doc | Location | Status |
|-----|----------|--------|
| PRD (this document) | `docs/product/prd.md` | ✅ Current |
| User Personas | `docs/product/user-personas.md` | ✅ Current |
| Feature Map | `docs/product/feature-map.md` | ✅ Current |
| User Flows | `docs/product/user-flows.md` | ✅ Current |
| Information Architecture | `docs/product/information-architecture.md` | ✅ Current |
| Tech Stack | `docs/architecture/tech-stack.md` | ✅ Current |
| Auth Strategy | `docs/architecture/auth-strategy.md` | ✅ Current |
| Multi-tenancy | `docs/architecture/multi-tenancy.md` | ✅ Current |
| Integration Strategy | `docs/architecture/integration-strategy.md` | ✅ Current |
| Deployment Strategy | `docs/architecture/deployment-strategy.md` | ✅ Current |
| Design System | `docs/design/design-system.md` | ✅ Current |
| Component Library | `docs/design/component-library.md` | ✅ Current |
| Working Instructions | `CLAUDE.md` | ✅ Current |
| Data Model | `docs/architecture/data-model.md` | 🔄 Pending |
| API Design | `docs/architecture/api-design.md` | 🔄 Pending |
| API Contracts | `docs/architecture/api-contracts.md` | 🔄 Pending (after UI finalized) |
| System Design | `docs/architecture/system-design.md` | 🔄 Pending |
