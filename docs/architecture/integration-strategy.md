# Integration Strategy — Primus EHR

---

## Integration Architecture Principles

1. **Adapter pattern:** Each integration is wrapped in an interface. Swapping providers = swap the adapter, not the business logic.
2. **Credentials in Secrets Manager:** Never hardcoded. Path: `primus/{env}/{tenant_id}/{integration}`.
3. **All external calls are async by default** for non-blocking user flows (except real-time eligibility, RTBC, PDMP).
4. **Circuit breaker:** All external HTTP calls wrapped with Resilience4j — fail open (degraded mode) rather than blocking the clinical workflow.
5. **All integrations IP-allowlisted:** No VPN tunnels; HTTPS + IP allowlist only.

---

## Phase 1 Integrations (Launch-Critical)

---

### 1. ScriptSure — e-Prescribing + EPCS

| Property | Value |
|----------|-------|
| **Purpose** | Electronic prescribing (non-controlled + controlled substances) |
| **Provider** | ScriptSure (Surescripts network partner) |
| **Protocol** | HTTPS REST API |
| **Phase** | 5 |
| **HIPAA BAA** | Required — obtained at contract signing |

**Key capabilities:**
- NewRx (new prescription to pharmacy)
- Refill request / cancel / change
- Refill response handling (from pharmacy)
- EPCS (Electronic Prescribing for Controlled Substances) — DEA Schedule II–V
- Medication history (patient fills from any pharmacy via Surescripts)
- Real-Time Benefit Check (RTBC) — patient's exact out-of-pocket cost
- Drug-drug interaction checking
- Drug-allergy interaction checking
- Formulary checking

**EPCS compliance requirements:**
- Two-factor authentication required for every controlled substance signature
- DEA audit via Drummond Group (required before go-live with EPCS)
- PDMP integration must be verified before EPCS activation
- Identity proofing for each prescribing provider (ID verification)
- Logical access controls — separate from regular prescribing

**Fallback:** If ScriptSure is unavailable:
- Non-controlled: Print prescription (PDF), fax manually
- Controlled: Cannot prescribe electronically — provider must write paper script
- Error shown: "e-Prescribing temporarily unavailable. Please use paper prescription."
- Incident logged; support team paged

---

### 2. Quest Diagnostics + Tribal Labs — Lab Orders and Results

| Property | Value |
|----------|-------|
| **Purpose** | Bidirectional lab order/result exchange |
| **Protocol** | HL7 v2.5.1 over HTTPS (HAPI HL7v2) |
| **Phase** | 4 |
| **Messages** | OML^O21 (order), ORU^R01 (results) |
| **HIPAA BAA** | Required |

**Order flow:**
```
Provider places order in Primus
→ Spring constructs HL7 OML^O21 message (HAPI HL7v2)
→ POST to Quest API endpoint (HTTPS, IP allowlisted)
→ Quest returns ACK with order ID
→ Order status: Pending Collection
```

**Result flow:**
```
Quest processes specimen
→ Quest POSTs HL7 ORU^R01 to Primus webhook endpoint
→ Spring parses ORU message (HAPI HL7v2)
→ Match to patient (MRN) and order
→ Parse results: LOINC codes, values, units, reference ranges, flags
→ Store in lab_results table
→ Trigger inbox notification for ordering provider
→ Flag critical values → Tier-1 alert
```

**LOINC mapping:** All incoming results must be mapped to LOINC codes for ONC compliance.

**Fallback:** If Quest API unavailable:
- Order queued in SQS (lab-orders queue)
- Retry with exponential backoff (1s, 2s, 4s, 8s, up to 30 min)
- After 30 min without ACK → alert to practice admin
- Results webhook uses idempotency key — safe to retry

---

### 3. VaxCare — Immunization Registry

| Property | Value |
|----------|-------|
| **Purpose** | Immunization administration records + state registry reporting |
| **Protocol** | HL7 v2 over API |
| **Phase** | 4 |
| **Messages** | ADT^A04 (patient registration), SIU^S12 (scheduling), VXU^V04 (vaccination record) |

**Flow:**
- Patient registered in Primus → ADT message sent to VaxCare
- Vaccination administered in clinic → VXU message sent to VaxCare
- VaxCare forwards to state Immunization Information System (IIS)
- Immunization history query: VXQ → VXR response for historical records

---

### 4. Stripe — Payments

| Property | Value |
|----------|-------|
| **Purpose** | Copay collection, patient balance payment, payment plans |
| **Protocol** | HTTPS REST API + webhooks |
| **Phase** | 6 |
| **HIPAA BAA** | Stripe provides BAA under Healthcare Add-on |
| **PCI DSS** | Stripe handles PCI scope; Primus never sees raw card numbers |

**Integration points:**
- Check-in: collect copay via Stripe Terminal SDK or manual card entry
- Patient portal: pay outstanding balance via Stripe Elements
- Payment plans: Stripe Subscriptions for recurring patient payments
- Webhook events: `payment_intent.succeeded`, `payment_intent.payment_failed`

**Note:** Primus stores `stripe_customer_id` and `stripe_payment_method_id` only — never raw card numbers. Stripe is PCI DSS SAQ A compliant for Primus's use case.

---

### 5. Availity — Claims Clearinghouse

| Property | Value |
|----------|-------|
| **Purpose** | Electronic claims submission, eligibility verification, ERA posting |
| **Protocol** | X12 EDI over HTTPS REST (Availity REST APIs) |
| **Phase** | 6 |
| **Transactions** | 837P (claims), 270/271 (eligibility), 835 (ERA), 276/277 (claim status) |

**Eligibility verification (270/271):**
- Triggered automatically 24h before each appointment
- Also available one-click at check-in
- Response: benefit breakdown, copay amounts, deductible remaining
- Response time: real-time (< 3 seconds)

**Claim submission (837P):**
- Triggered on claim approval in billing queue
- Supported: professional (837P), will add institutional (837I) in later phase
- Acknowledgment: TA1 (interchange), 999 (functional)
- Claim status: 276/277 polling daily

**ERA posting (835):**
- Availity delivers ERA files to Primus SFTP or webhook
- Auto-matching: ERA line → open claim
- Exceptions (denials, adjustments) → flagged in denial queue
- Auto-post matched payments; hold exceptions for billing review

**Fallback:** If Availity API unavailable:
- Queue claims in SQS; retry with backoff
- Alert billing team
- Never block clinical workflow — claim submission is async

---

### 6. Twilio — SMS and Voice

| Property | Value |
|----------|-------|
| **Purpose** | Appointment reminders, OTP, patient notifications (no PHI in SMS) |
| **Protocol** | HTTPS REST API + webhooks |
| **Phase** | 8 |
| **HIPAA BAA** | Required — Twilio HIPAA-eligible services only |

**Use cases:**
- Appointment reminders: "Your appointment is tomorrow at 2pm with Dr. Chen. Reply CANCEL to cancel."
- OTP for patient portal registration: "Your Primus verification code is 847291"
- Lab result notification: "Your lab results are ready. Log in to view: https://my.primusehr.com"
- Intake form link: "Please complete your pre-visit form: [link]"

**Critical rule: Zero PHI in SMS/voice.** Notifications only — patient must authenticate to portal to read any clinical content.

**Opt-out handling:** Twilio handles STOP/HELP keywords automatically; Primus stores opt-out status per patient.

---

### 7. AWS SES — Email

| Property | Value |
|----------|-------|
| **Purpose** | Appointment confirmations, portal invitations, notification emails (no PHI) |
| **Protocol** | AWS SDK v3 |
| **Phase** | 8 |

Same PHI rule as Twilio: notification-only emails. No clinical content in email body.

---

### 8. Jitsi (local) / Amazon Chime SDK (production) — Video

| Property | Value |
|----------|-------|
| **Purpose** | Telehealth video visits |
| **Local dev** | Jitsi Docker (self-hosted) |
| **Production** | Amazon Chime SDK |
| **Phase** | 7 |

**Abstraction layer:**
```typescript
// VideoProvider interface — same API for Jitsi and Chime
interface VideoProvider {
  createRoom(appointmentId: string): Promise<VideoRoom>;
  getJoinToken(roomId: string, participantId: string, role: 'host' | 'guest'): Promise<string>;
  endRoom(roomId: string): Promise<void>;
}

// Env-controlled switch
const provider = process.env.VIDEO_PROVIDER === 'chime' 
  ? new ChimeVideoProvider() 
  : new JitsiVideoProvider();
```

**Chime SDK pricing (production):** $0.0017/participant/minute. ~$0.05 per 15-min visit. $0 when not in use.

---

## Phase 2+ Integrations

### Google Maps — Address Autocomplete

| Property | Value |
|----------|-------|
| **Purpose** | Address validation and autocomplete during patient registration |
| **Protocol** | HTTPS REST (Places API) |
| **Phase** | 2 |

**Note:** Only address text — no PHI sent to Google Maps. Frontend-only integration; API key restricted to Maps domain only.

---

### Firebase — Push Notifications

| Property | Value |
|----------|-------|
| **Purpose** | Mobile push notifications for patient portal app (future) |
| **Protocol** | HTTPS REST (FCM) |
| **Phase** | 8 |

---

### Superset — Analytics Dashboards

| Property | Value |
|----------|-------|
| **Purpose** | Embedded analytics for Tenant Admins and Practice Admins |
| **Protocol** | Self-hosted on ECS, embedded via SDK |
| **Phase** | 9 |

**Note:** Same as Primus Demo Clinic — self-hosted Superset within VPC. Queries read-replica Aurora. PHI visible only to authenticated users via Superset row-level security.

---

## HL7 / FHIR Roadmap

| Standard | Status | Target Phase |
|----------|--------|-------------|
| HL7 v2 (OML/ORU/VXU/ADT) | Phase 4 | Labs + Immunizations |
| FHIR R4 — Patient Access APIs | Phase 10 | ONC certification |
| FHIR R4 — Provider Directory | Phase 10 | TEFCA subparticipation |
| DaVinci PAS (Prior Auth) | Phase 10 | CMS mandate Jan 2027 |
| USCDI v3 | Phase 10 | ONC HTI-1 compliance |
| TEFCA QHIN subparticipation | Phase 10 | Via Kno2 or eHealth Exchange |

**Note:** FHIR is deliberately deferred until Phase 10. Building FHIR APIs before the product is feature-complete wastes effort. The DDD domain model is designed to map cleanly to FHIR resources when the time comes.

---

## Integration Credential Management

```
AWS Secrets Manager paths:
primus/{env}/integrations/surescripts/api_key
primus/{env}/integrations/quest/client_id
primus/{env}/integrations/quest/client_secret
primus/{env}/{tenant_id}/integrations/availity/api_key
primus/{env}/{tenant_id}/integrations/stripe/secret_key
primus/{env}/integrations/twilio/account_sid
primus/{env}/integrations/twilio/auth_token
primus/{env}/integrations/chime/access_key_id
primus/{env}/integrations/chime/secret_access_key

Rotation: 
- Stripe and Twilio: manual rotation annually (or on compromise)
- AWS credentials: IAM roles preferred over key pairs
- Quest/ScriptSure: per vendor contract schedule
```
