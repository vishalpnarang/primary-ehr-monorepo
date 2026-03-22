# Primus EHR — HIPAA Security Risk Assessment (SRA)

## Document Control

| Field | Value |
|-------|-------|
| **Document Title** | HIPAA Security Risk Assessment |
| **System** | Primus EHR Platform |
| **Organization** | Thinkitive Technologies |
| **Assessment Date** | March 22, 2026 |
| **Assessment Period** | March 2026 — March 2027 |
| **Assessor** | Thinkitive Technologies — Information Security Team |
| **Methodology** | NIST SP 800-30 Rev. 1 (Guide for Conducting Risk Assessments) |
| **Regulatory Basis** | 45 CFR 164.308(a)(1)(ii)(A) — Security Management Process |
| **Classification** | Confidential — Internal Use Only |
| **Version** | 1.0 |

---

## 1. Purpose and Scope

### Purpose

This Security Risk Assessment (SRA) identifies and evaluates risks to the confidentiality, integrity, and availability of electronic Protected Health Information (ePHI) created, received, maintained, or transmitted by the Primus EHR platform. This assessment satisfies the requirement under 45 CFR 164.308(a)(1)(ii)(A) of the HIPAA Security Rule.

### Scope

This assessment covers all information systems, components, and processes that store, process, or transmit ePHI within the Primus EHR platform, including:

- Provider Portal (web application for clinical staff)
- Patient Portal (web application for patients)
- Backend API services (Spring Boot)
- Database systems (PostgreSQL on Amazon Aurora)
- Authentication and authorization services (Keycloak)
- Cloud infrastructure (AWS)
- Third-party integrations (Stripe, Twilio, Quest, Availity, ScriptSure)
- Administrative processes (workforce management, incident response, BAAs)

### Out of Scope

- Client-owned hardware and networks (covered by each client's own SRA)
- Personal devices of end users
- Non-electronic PHI (paper records)

---

## 2. System Description

### Architecture Overview

Primus EHR is a multi-tenant SaaS platform built for primary care clinics in the United States. The system processes ePHI for patient demographics, clinical encounters, medications, lab results, billing claims, and appointment scheduling.

```
                        Internet
                           |
                    [AWS WAFv2 + CloudFront]
                           |
                    [Application Load Balancer]
                      /              \
          [Provider Portal]    [Patient Portal]
          React + Vite + TS    React + Vite + TS
                      \              /
                    [API Gateway / Spring Boot]
                    Java 21, DDD Architecture
                           |
              +------------+------------+
              |            |            |
        [Keycloak]   [PostgreSQL]  [S3 Storage]
        ECS Fargate  Aurora RDS    Document Store
                           |
              +------------+------------+
              |            |            |
         [Twilio]     [Stripe]    [Quest/Availity]
         SMS/MFA      Payments    Labs/Claims
```

### Technology Stack

| Component | Technology | PHI Exposure |
|-----------|-----------|--------------|
| Provider Portal | React 18, Vite, TypeScript | Displays ePHI in browser |
| Patient Portal | React 18, Vite, TypeScript | Displays ePHI in browser |
| Backend API | Spring Boot 3, Java 21 | Processes all ePHI |
| Database | PostgreSQL 16 (Aurora) | Stores all ePHI at rest |
| Authentication | Keycloak 24 (ECS Fargate) | Manages user identities |
| Object Storage | AWS S3 | Stores documents, attachments |
| CDN / WAF | CloudFront + WAFv2 | Inspects traffic (no PHI storage) |
| SMS Notifications | Twilio | Minimal PHI (names, appt times) |
| Payments | Stripe | Billing amounts, patient names |
| Labs | Quest Diagnostics (HL7) | Lab orders, results |
| Claims | Availity (EDI 837/835) | Claims with diagnoses, procedures |
| E-Prescribing | ScriptSure (EPCS) | Medications, patient demographics |

### Multi-Tenancy Model

Each tenant (clinic organization) operates in an isolated PostgreSQL schema. The application uses Hibernate's `SCHEMA` multi-tenancy mode to route queries to the correct schema at runtime. Tenant context is derived from the authenticated user's JWT token and validated on every request.

---

## 3. Asset Inventory

### Systems That Store, Process, or Transmit ePHI

| Asset ID | Asset Name | Type | Location | ePHI Classification | Owner |
|----------|-----------|------|----------|---------------------|-------|
| A-001 | Aurora PostgreSQL (Primary) | Database | AWS us-east-1 | Store | Platform Engineering |
| A-002 | Aurora PostgreSQL (Replica) | Database | AWS us-east-1 | Store | Platform Engineering |
| A-003 | S3 Document Bucket | Object Storage | AWS us-east-1 | Store | Platform Engineering |
| A-004 | Spring Boot API (ECS) | Application | AWS us-east-1 | Process/Transmit | Backend Engineering |
| A-005 | Keycloak (ECS Fargate) | Auth Service | AWS us-east-1 | Process | Platform Engineering |
| A-006 | Provider Portal (CloudFront) | Web App | AWS Edge | Transmit/Display | Frontend Engineering |
| A-007 | Patient Portal (CloudFront) | Web App | AWS Edge | Transmit/Display | Frontend Engineering |
| A-008 | ALB (Application Load Balancer) | Network | AWS us-east-1 | Transmit | Platform Engineering |
| A-009 | VPC and Subnets | Network | AWS us-east-1 | Transmit | Platform Engineering |
| A-010 | CloudWatch Logs | Logging | AWS us-east-1 | May contain masked PHI | Platform Engineering |
| A-011 | S3 Audit Log Bucket | Storage | AWS us-east-1 | Store (access metadata) | Security |
| A-012 | Twilio (External) | SaaS | Twilio Cloud | Transmit | Platform Engineering |
| A-013 | Stripe (External) | SaaS | Stripe Cloud | Transmit | Billing Engineering |
| A-014 | Quest HL7 Interface | Integration | AWS us-east-1 | Transmit | Integration Engineering |
| A-015 | Availity EDI Interface | Integration | AWS us-east-1 | Transmit | Integration Engineering |
| A-016 | ScriptSure Interface | Integration | AWS us-east-1 | Transmit | Integration Engineering |
| A-017 | Developer Workstations | Endpoint | On-premise/Remote | Process (dev/staging only) | Engineering |
| A-018 | GitHub Repository | Source Control | GitHub Cloud | No ePHI (code only) | Engineering |
| A-019 | CI/CD Pipeline (GitHub Actions) | Automation | GitHub Cloud | No ePHI (deploys code) | DevOps |
| A-020 | Terraform State (S3) | IaC State | AWS us-east-1 | No ePHI (infra config) | DevOps |

---

## 4. Risk Assessment Methodology

### NIST SP 800-30 Rev. 1

This assessment follows the NIST SP 800-30 framework for conducting risk assessments:

1. **Identify threat sources and events** — internal, external, environmental
2. **Identify vulnerabilities and predisposing conditions** — technical, administrative, physical
3. **Determine likelihood of occurrence** — based on threat capability and existing controls
4. **Determine magnitude of impact** — to confidentiality, integrity, and availability of ePHI
5. **Determine risk** — likelihood x impact, categorized by severity

### Likelihood Scale

| Score | Level | Definition |
|-------|-------|------------|
| 1 | Very Low | Unlikely to occur; strong controls in place |
| 2 | Low | Could occur but improbable given current controls |
| 3 | Moderate | Possible; controls exist but may not fully prevent |
| 4 | High | Likely to occur; controls are insufficient |
| 5 | Very High | Almost certain to occur; no effective controls |

### Impact Scale

| Score | Level | Definition |
|-------|-------|------------|
| 1 | Negligible | No ePHI exposure; minor operational inconvenience |
| 2 | Minor | Limited ePHI exposure (<10 records); short-term disruption |
| 3 | Moderate | Significant ePHI exposure (10-500 records); service degradation |
| 4 | Major | Large-scale ePHI exposure (500-10,000 records); extended outage |
| 5 | Critical | Massive breach (>10,000 records); regulatory action; existential risk |

### Risk Score Matrix

| | Impact 1 | Impact 2 | Impact 3 | Impact 4 | Impact 5 |
|---|---|---|---|---|---|
| **Likelihood 5** | 5 (Med) | 10 (Med) | 15 (High) | 20 (Crit) | 25 (Crit) |
| **Likelihood 4** | 4 (Low) | 8 (Med) | 12 (High) | 16 (High) | 20 (Crit) |
| **Likelihood 3** | 3 (Low) | 6 (Med) | 9 (Med) | 12 (High) | 15 (High) |
| **Likelihood 2** | 2 (Low) | 4 (Low) | 6 (Med) | 8 (Med) | 10 (Med) |
| **Likelihood 1** | 1 (Low) | 2 (Low) | 3 (Low) | 4 (Low) | 5 (Med) |

### Risk Classification

| Risk Score | Classification | Action Required |
|------------|---------------|-----------------|
| 1-4 | **Low** | Accept or monitor; address in normal cycle |
| 5-10 | **Medium** | Mitigate within 6 months |
| 11-16 | **High** | Mitigate within 90 days |
| 17-25 | **Critical** | Mitigate immediately (within 30 days) |

---

## 5. Risk Register

### Administrative Risks

| Risk ID | Threat / Vulnerability | Asset Affected | L | I | Score | Current Controls | Residual Risk | Mitigation Plan | Target Date | Owner |
|---------|----------------------|----------------|---|---|-------|-----------------|---------------|-----------------|-------------|-------|
| SRA-001 | Workforce member accesses ePHI without authorization due to insufficient training | A-001, A-004 | 3 | 3 | 9 | HIPAA training policy defined; role-based access via Keycloak | Medium | Implement mandatory annual HIPAA training with completion tracking and attestation; block system access until training is completed | 2026-06-30 | HIPAA Privacy Officer |
| SRA-002 | Terminated employee retains system access after departure | A-004, A-005 | 2 | 4 | 8 | Keycloak account management; manual deprovisioning process | Medium | Implement automated deprovisioning triggered by HR system events; enforce maximum 24-hour access removal SLA; conduct quarterly access reviews | 2026-06-30 | IT Operations |
| SRA-003 | No documented incident response plan leads to delayed breach notification | All assets | 3 | 5 | 15 | Basic incident awareness among engineering team; no formal IRP documented | High | Document formal Incident Response Plan with roles, escalation paths, forensic procedures, and HIPAA breach notification timelines (60 days); conduct tabletop exercise | 2026-05-31 | HIPAA Security Officer |
| SRA-004 | Business Associate fails to safeguard ePHI, causing indirect breach | A-012 to A-016 | 2 | 4 | 8 | BAAs signed with AWS, Stripe, Twilio; vendor security reviews not formalized | Medium | Establish annual vendor security review process; require SOC 2 Type II reports from all BA vendors; maintain BA inventory with BAA expiration tracking | 2026-09-30 | HIPAA Security Officer |
| SRA-005 | Lack of sanction policy means workforce violations go unaddressed | All assets | 2 | 3 | 6 | Employee handbook references general disciplinary procedures | Medium | Draft and publish formal HIPAA Sanction Policy with graduated consequences for privacy/security violations; integrate into employee onboarding | 2026-07-31 | HR / HIPAA Privacy Officer |
| SRA-006 | Insufficient security awareness leads to phishing-based credential theft | A-005, A-017 | 3 | 4 | 12 | Email filtering at corporate level; no formal phishing simulation program | High | Deploy quarterly phishing simulation campaigns; implement security awareness training; track click rates and remediation | 2026-06-30 | IT Security |

### Technical Risks

| Risk ID | Threat / Vulnerability | Asset Affected | L | I | Score | Current Controls | Residual Risk | Mitigation Plan | Target Date | Owner |
|---------|----------------------|----------------|---|---|-------|-----------------|---------------|-----------------|-------------|-------|
| SRA-007 | SQL injection attack exfiltrates ePHI from database | A-001, A-004 | 2 | 5 | 10 | Spring Data JPA parameterized queries; WAFv2 SQL injection rules; input validation via Zod/Bean Validation | Medium | Add automated SAST scanning (SonarQube) in CI pipeline; conduct annual penetration test; review all native SQL queries for injection vectors | 2026-05-31 | Backend Engineering |
| SRA-008 | Cross-site scripting (XSS) attack steals session tokens or displays malicious content | A-006, A-007 | 2 | 4 | 8 | React's default output escaping; Content Security Policy headers; WAFv2 XSS rules | Medium | Audit all uses of `dangerouslySetInnerHTML`; implement strict CSP with nonce-based script allowlisting; add XSS-specific test cases to SAST | 2026-06-30 | Frontend Engineering |
| SRA-009 | Broken authentication allows unauthorized access to clinical data | A-004, A-005 | 2 | 5 | 10 | Keycloak OIDC + PKCE flow; JWT validation on every API request; rate limiting on auth endpoints (5/min); session timeout | Medium | Enforce MFA for all clinical staff (TOTP or WebAuthn); implement account lockout after 5 failed attempts; add brute-force detection alerting | 2026-05-31 | Platform Engineering |
| SRA-010 | Insecure Direct Object Reference (IDOR) allows cross-patient data access | A-004 | 2 | 5 | 10 | Tenant-scoped queries via Hibernate SCHEMA mode; @PreAuthorize annotations on all controllers | Medium | Implement object-level authorization checks (verify requesting user has relationship to requested patient); add IDOR-specific integration tests | 2026-06-30 | Backend Engineering |
| SRA-011 | Cross-Site Request Forgery (CSRF) executes unauthorized state changes | A-004 | 2 | 3 | 6 | CSRF token (cookie-based); SameSite cookie attribute; Origin header validation | Medium | Verify CSRF protection covers all state-changing endpoints; add CSRF test coverage to integration tests | 2026-07-31 | Backend Engineering |
| SRA-012 | Audit log tampering or deletion destroys forensic evidence | A-011 | 2 | 4 | 8 | AuditInterceptor captures all API access; logs stored in S3; CloudWatch logging | Medium | Enable S3 Object Lock (WORM) on audit log bucket; implement log integrity verification (hash chaining); set up alerting on log deletion attempts | 2026-06-30 | Platform Engineering |
| SRA-013 | Insufficient PHI masking in application logs exposes sensitive data | A-010 | 2 | 3 | 6 | PhiLogFilter masks 22 PHI field types in application logs | Medium | Conduct quarterly log review for PHI leakage; add automated log scanning for PHI patterns (SSN, MRN, DOB); extend masking to cover any custom log statements | 2026-07-31 | Backend Engineering |
| SRA-014 | Encryption key compromise exposes all ePHI at rest | A-001, A-003 | 1 | 5 | 5 | AWS KMS managed encryption keys; AES-256-GCM encryption at rest for Aurora and S3 | Medium | Implement key rotation policy (annual minimum); restrict KMS key policy to minimum necessary IAM roles; enable KMS key usage logging and alerting | 2026-09-30 | Platform Engineering |
| SRA-015 | Session hijacking via stolen JWT token | A-004, A-005 | 2 | 4 | 8 | Short-lived access tokens (15 min); refresh token rotation; Secure + HttpOnly + SameSite cookies | Medium | Implement token binding to client fingerprint; add anomaly detection for concurrent sessions from different locations; enforce re-authentication for sensitive operations | 2026-06-30 | Platform Engineering |
| SRA-016 | Multi-tenant data leakage — queries return data from wrong tenant schema | A-001, A-004 | 1 | 5 | 5 | Hibernate SCHEMA multi-tenancy; tenant context from JWT; schema name validation | Medium | Implement PostgreSQL Row-Level Security (RLS) as defense-in-depth; add cross-tenant data leakage integration tests; conduct quarterly tenant isolation audits | 2026-06-30 | Backend Engineering |

### Physical Risks

| Risk ID | Threat / Vulnerability | Asset Affected | L | I | Score | Current Controls | Residual Risk | Mitigation Plan | Target Date | Owner |
|---------|----------------------|----------------|---|---|-------|-----------------|---------------|-----------------|-------------|-------|
| SRA-017 | Lost or stolen developer workstation with cached credentials or local data | A-017 | 2 | 3 | 6 | Full-disk encryption required (FileVault/BitLocker); VPN required for staging access; no production ePHI on dev machines | Medium | Enforce MDM enrollment for all developer devices; implement remote wipe capability; prohibit local database copies with ePHI; require screen lock after 5 minutes | 2026-07-31 | IT Operations |
| SRA-018 | Unauthorized physical access to workstation in clinical setting | A-017 | 3 | 3 | 9 | Automatic session timeout in Primus (15 min); screen lock policy | Medium | Reduce session timeout to 5 minutes for clinical workstations; implement proximity-based lock (badge tap to unlock); publish clean desk policy | 2026-07-31 | IT Operations |
| SRA-019 | Natural disaster or power failure at AWS region causes extended outage | A-001 to A-009 | 1 | 4 | 4 | AWS multi-AZ deployment; Aurora automated backups; infrastructure as code (Terraform) | Low | Implement cross-region disaster recovery plan; test failover procedures quarterly; maintain RTO < 4 hours and RPO < 1 hour documentation | 2026-12-31 | Platform Engineering |

### Infrastructure Risks

| Risk ID | Threat / Vulnerability | Asset Affected | L | I | Score | Current Controls | Residual Risk | Mitigation Plan | Target Date | Owner |
|---------|----------------------|----------------|---|---|-------|-----------------|---------------|-----------------|-------------|-------|
| SRA-020 | Unpatched vulnerabilities in OS, runtime, or dependencies exploited by attacker | A-004, A-005 | 3 | 4 | 12 | Dependabot alerts on GitHub; ECS uses managed container images | High | Implement automated vulnerability scanning in CI (Trivy or Snyk); enforce maximum 72-hour SLA for critical CVE patches; schedule monthly patching windows | 2026-05-31 | DevOps |
| SRA-021 | DDoS attack overwhelms application, causing denial of service for clinical users | A-008, A-004 | 2 | 4 | 8 | AWS Shield Standard; WAFv2 rate limiting; CloudFront distribution | Medium | Evaluate AWS Shield Advanced for enhanced DDoS protection; implement auto-scaling policies for ECS services; establish DDoS response runbook | 2026-09-30 | Platform Engineering |
| SRA-022 | Backup failure or corruption prevents data recovery after incident | A-001, A-003 | 2 | 5 | 10 | Aurora automated daily snapshots (35-day retention); S3 versioning enabled | Medium | Implement monthly backup restore testing to verify recoverability; document and test full disaster recovery procedure; maintain offsite backup copy | 2026-06-30 | Platform Engineering |
| SRA-023 | Insufficient network segmentation allows lateral movement after initial compromise | A-009 | 2 | 4 | 8 | VPC with public/private subnets; security groups restrict port access; database in private subnet | Medium | Implement additional network segmentation (separate subnets for app, data, and management tiers); deploy VPC Flow Logs with anomaly detection; restrict all outbound traffic to allow-list | 2026-07-31 | Platform Engineering |
| SRA-024 | Misconfigured IAM permissions grant excessive access to AWS resources | A-001 to A-011 | 3 | 4 | 12 | IAM roles with policies per service; no root account usage | High | Conduct IAM access review quarterly; implement AWS Access Analyzer; enforce least-privilege principle with automated policy generation; enable IAM Access Advisor | 2026-05-31 | DevOps |

### Third-Party Risks

| Risk ID | Threat / Vulnerability | Asset Affected | L | I | Score | Current Controls | Residual Risk | Mitigation Plan | Target Date | Owner |
|---------|----------------------|----------------|---|---|-------|-----------------|---------------|-----------------|-------------|-------|
| SRA-025 | Third-party vendor (Twilio/Stripe) suffers breach exposing transmitted ePHI | A-012, A-013 | 2 | 3 | 6 | BAAs signed; minimal PHI transmitted to vendors; Stripe is PCI DSS L1 certified | Medium | Minimize PHI sent to third parties (use tokens/references where possible); monitor vendor security advisories; require annual SOC 2 Type II reports; define contingency for vendor replacement | 2026-09-30 | HIPAA Security Officer |
| SRA-026 | Cloud provider (AWS) experiences region-wide outage or data loss event | A-001 to A-011 | 1 | 5 | 5 | Multi-AZ deployment; automated backups; Terraform IaC for rapid re-deployment | Medium | Document and test cross-region failover procedure; maintain infrastructure runbooks; evaluate multi-region active-active architecture for future | 2026-12-31 | Platform Engineering |
| SRA-027 | Surescripts/ScriptSure integration failure causes e-prescribing outage | A-016 | 2 | 3 | 6 | Integration monitoring; manual prescribing fallback available | Medium | Implement health check monitoring with automated alerting; document manual prescribing workflow as fallback; maintain SLA monitoring dashboard | 2026-07-31 | Integration Engineering |
| SRA-028 | HL7 interface with Quest transmits unencrypted lab data | A-014 | 2 | 4 | 8 | VPN tunnel for HL7 connections; TLS encryption | Medium | Verify TLS 1.2+ on all HL7 connections; implement message-level encryption for HL7 payloads; conduct quarterly connection security audits | 2026-07-31 | Integration Engineering |

### Application-Specific Risks

| Risk ID | Threat / Vulnerability | Asset Affected | L | I | Score | Current Controls | Residual Risk | Mitigation Plan | Target Date | Owner |
|---------|----------------------|----------------|---|---|-------|-----------------|---------------|-----------------|-------------|-------|
| SRA-029 | Break-glass access not available — emergency providers cannot access critical patient data | A-004, A-005 | 2 | 5 | 10 | No break-glass mechanism currently implemented | Medium | Implement break-glass emergency access with enhanced auditing, automatic notifications, mandatory justification, and 24-hour review process | 2026-06-30 | Backend Engineering |
| SRA-030 | Data Loss Prevention (DLP) gap — ePHI downloaded or exported without controls | A-006, A-007 | 3 | 4 | 12 | Role-based access limits who can view data; no export controls | High | Implement DLP controls: restrict bulk data exports, watermark downloaded documents, log all data exports, implement copy/paste restrictions for sensitive fields | 2026-06-30 | Security Engineering |
| SRA-031 | API rate limiting bypass allows automated data scraping | A-004 | 2 | 4 | 8 | Per-user and per-IP rate limiting; auth endpoint limited to 5/min | Medium | Implement adaptive rate limiting based on request patterns; add API abuse detection; implement progressive response delays for repeated violations | 2026-07-31 | Backend Engineering |

---

## 6. Current Security Controls Summary

The following security controls are currently implemented in the Primus EHR platform.

### Authentication and Authorization

| Control | Implementation | HIPAA Reference |
|---------|---------------|-----------------|
| Unique user identification | Keycloak assigns unique user IDs; no shared accounts | 164.312(a)(2)(i) |
| Authentication | Keycloak OIDC with PKCE flow; JWT bearer tokens | 164.312(d) |
| Role-based access control | 8 roles (Super Admin through Patient); `@PreAuthorize` annotations on all Spring Boot controllers | 164.312(a)(1) |
| Automatic logoff | Configurable session timeout (default 15 min); JWT access token expiry (15 min) | 164.312(a)(2)(iii) |
| Password policy | Keycloak enforced: minimum 12 characters, complexity requirements, breach database check | 164.312(a)(2)(i) |
| Rate limiting | Per-user and per-IP rate limits; authentication endpoints capped at 5 requests/minute | 164.312(a)(1) |

### Encryption

| Control | Implementation | HIPAA Reference |
|---------|---------------|-----------------|
| Encryption at rest | AES-256-GCM via AWS KMS for Aurora PostgreSQL and S3 | 164.312(a)(2)(iv) |
| Encryption in transit | TLS 1.3 enforced on all external connections; TLS 1.2 minimum for internal services | 164.312(e)(1) |
| Key management | AWS KMS with automatic key rotation; separate keys per service | 164.312(a)(2)(iv) |

### Audit Controls

| Control | Implementation | HIPAA Reference |
|---------|---------------|-----------------|
| Audit logging | `AuditInterceptor` captures all API access: user, action, resource, timestamp, IP, tenant | 164.312(b) |
| PHI log masking | `PhiLogFilter` masks 22 PHI field types (SSN, MRN, DOB, address, phone, etc.) in application logs | 164.312(b) |
| Log storage | Audit logs stored in S3 with 6-year retention; CloudWatch for operational logs | 164.312(b) |
| Log monitoring | CloudWatch alarms for error rates and unusual access patterns | 164.312(b) |

### Network Security

| Control | Implementation | HIPAA Reference |
|---------|---------------|-----------------|
| Web Application Firewall | AWS WAFv2 with OWASP Top 10 managed rules | 164.312(e)(1) |
| Network segmentation | VPC with public, private, and database subnets; security groups enforce port-level access | 164.312(e)(1) |
| DDoS protection | AWS Shield Standard; CloudFront edge caching | 164.312(a)(1) |
| Security headers | HSTS (max-age 31536000, includeSubDomains), CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin | 164.312(e)(1) |

### Application Security

| Control | Implementation | HIPAA Reference |
|---------|---------------|-----------------|
| CSRF protection | Cookie-based CSRF token; SameSite cookie attribute | 164.312(e)(1) |
| Input validation | Zod schemas (frontend), Bean Validation (backend); parameterized queries via Spring Data JPA | 164.312(e)(1) |
| Multi-tenant isolation | Schema-per-tenant via Hibernate SCHEMA mode; tenant context validated from JWT on every request | 164.312(a)(1) |
| Dependency scanning | Dependabot alerts enabled on GitHub repository | 164.308(a)(1) |

### Administrative Controls

| Control | Implementation | HIPAA Reference |
|---------|---------------|-----------------|
| Business Associate Agreements | Signed BAAs with AWS, Stripe, Twilio, Quest, Availity, ScriptSure | 164.314(a) |
| Backup and recovery | Aurora automated daily snapshots (35-day retention); S3 versioning | 164.308(a)(7) |
| Infrastructure as Code | Terraform for all AWS resources; version-controlled, peer-reviewed | 164.308(a)(1) |

---

## 7. Gap Analysis

The following required or recommended controls are NOT yet fully implemented. These represent the highest-priority items for remediation.

| Gap ID | Control Gap | HIPAA Reference | Risk IDs | Priority | Status |
|--------|------------|-----------------|----------|----------|--------|
| GAP-001 | **MFA not enforced for clinical staff** — Keycloak supports MFA but it is not yet mandatory for all clinical roles | 164.312(d) | SRA-009 | Critical | Not Started |
| GAP-002 | **Formal Incident Response Plan not documented** — No written IRP with roles, escalation paths, breach notification timelines | 164.308(a)(6) | SRA-003 | Critical | Not Started |
| GAP-003 | **Penetration test not conducted** — No external penetration test has been performed against the platform | 164.308(a)(8) | SRA-007, SRA-008, SRA-010 | High | Not Started |
| GAP-004 | **PostgreSQL Row-Level Security (RLS) not implemented** — Schema isolation is in place, but RLS adds defense-in-depth for multi-tenant data separation | 164.312(a)(1) | SRA-016 | High | Not Started |
| GAP-005 | **Break-glass emergency access not implemented** — No mechanism for emergency provider access to patient records outside normal permissions | 164.312(a)(2)(i) | SRA-029 | High | Not Started |
| GAP-006 | **Automated vulnerability scanning not in CI pipeline** — Dependabot provides dependency alerts but no SAST/DAST/container scanning in the CI/CD pipeline | 164.308(a)(1) | SRA-020 | High | Not Started |
| GAP-007 | **Data Loss Prevention (DLP) controls not implemented** — No controls to prevent unauthorized download, export, or exfiltration of bulk ePHI | 164.312(a)(1) | SRA-030 | High | Not Started |
| GAP-008 | **Backup restore testing not conducted** — Backups are automated but have never been tested for successful restoration | 164.308(a)(7) | SRA-022 | High | Not Started |
| GAP-009 | **SOC 2 policies not drafted** — No formal information security policies aligned to SOC 2 Trust Service Criteria | 164.316(a) | SRA-004 | Medium | Not Started |
| GAP-010 | **Formal HIPAA training program with tracking not deployed** — Training policy exists but no LMS, completion tracking, or annual recertification process | 164.308(a)(5) | SRA-001 | Medium | Not Started |
| GAP-011 | **Phishing simulation program not deployed** — No regular phishing awareness testing for workforce | 164.308(a)(5) | SRA-006 | Medium | Not Started |
| GAP-012 | **Formal sanction policy not published** — No documented graduated sanctions for HIPAA violations | 164.308(a)(1)(ii)(C) | SRA-005 | Medium | Not Started |
| GAP-013 | **Audit log integrity protection not implemented** — Logs are stored in S3 but Object Lock (WORM) is not enabled; no hash-chain verification | 164.312(b) | SRA-012 | Medium | Not Started |
| GAP-014 | **Cross-region disaster recovery not tested** — Multi-AZ is configured but no cross-region failover has been tested or documented | 164.308(a)(7) | SRA-019, SRA-026 | Medium | Not Started |
| GAP-015 | **MDM not enforced on developer devices** — Full-disk encryption is required by policy but not verified via Mobile Device Management | 164.310(d)(1) | SRA-017 | Medium | Not Started |

---

## 8. Remediation Roadmap

Prioritized by risk score, regulatory urgency, and implementation complexity.

### Phase 1 — Critical (Complete by May 31, 2026)

| Item | Gap ID | Risk IDs | Risk Score | Action | Owner |
|------|--------|----------|------------|--------|-------|
| 1.1 | GAP-002 | SRA-003 | 15 | Document formal Incident Response Plan; assign IRT roles; define breach notification workflow per HIPAA (60-day individual notice, HHS notification); conduct first tabletop exercise | HIPAA Security Officer |
| 1.2 | GAP-001 | SRA-009 | 10 | Enable and enforce MFA in Keycloak for all clinical, administrative, and super-admin roles; support TOTP and WebAuthn; communicate rollout to all tenants | Platform Engineering |
| 1.3 | GAP-006 | SRA-020 | 12 | Integrate SonarQube (SAST), Trivy (container scanning), and OWASP ZAP (DAST) into GitHub Actions CI pipeline; fail builds on critical/high findings | DevOps |
| 1.4 | — | SRA-024 | 12 | Conduct IAM access review; enable AWS Access Analyzer; remediate overly permissive policies; document least-privilege IAM standard | DevOps |

### Phase 2 — High (Complete by June 30, 2026)

| Item | Gap ID | Risk IDs | Risk Score | Action | Owner |
|------|--------|----------|------------|--------|-------|
| 2.1 | GAP-003 | SRA-007, SRA-008, SRA-010 | 10 | Engage third-party firm for external penetration test (black-box and gray-box); remediate all critical and high findings within 30 days | Security Engineering |
| 2.2 | GAP-004 | SRA-016 | 5 | Implement PostgreSQL RLS policies as defense-in-depth for tenant isolation; verify with cross-tenant query tests | Backend Engineering |
| 2.3 | GAP-005 | SRA-029 | 10 | Implement break-glass access: elevated temporary permissions with mandatory justification, enhanced audit logging, automatic notifications to Security Officer, 24-hour review | Backend Engineering |
| 2.4 | GAP-007 | SRA-030 | 12 | Implement DLP controls: restrict bulk data export, watermark documents, log all exports, implement copy/paste restrictions for SSN and other high-sensitivity fields | Security Engineering |
| 2.5 | GAP-008 | SRA-022 | 10 | Execute first backup restore test (full Aurora snapshot restore to isolated environment); document procedure; schedule monthly automated tests | Platform Engineering |
| 2.6 | GAP-010 | SRA-001 | 9 | Deploy HIPAA training program via LMS; require completion within 30 days of hire and annually thereafter; track completion rates per tenant | HIPAA Privacy Officer |
| 2.7 | GAP-011 | SRA-006 | 12 | Deploy first phishing simulation campaign; establish baseline click rates; implement quarterly cadence | IT Security |
| 2.8 | GAP-013 | SRA-012 | 8 | Enable S3 Object Lock (Governance mode) on audit log bucket; implement hash-chain log integrity verification | Platform Engineering |

### Phase 3 — Medium (Complete by September 30, 2026)

| Item | Gap ID | Risk IDs | Risk Score | Action | Owner |
|------|--------|----------|------------|--------|-------|
| 3.1 | GAP-009 | SRA-004 | 8 | Draft SOC 2-aligned information security policies: Access Control, Change Management, Incident Response, Risk Management, Vendor Management, Data Classification | HIPAA Security Officer |
| 3.2 | GAP-012 | SRA-005 | 6 | Publish HIPAA Sanction Policy with graduated consequences; integrate into employee handbook and onboarding | HR / HIPAA Privacy Officer |
| 3.3 | GAP-015 | SRA-017 | 6 | Evaluate and deploy MDM solution (Jamf for macOS, Intune for Windows); enforce full-disk encryption verification, remote wipe capability, screen lock policy | IT Operations |
| 3.4 | — | SRA-025 | 6 | Establish formal vendor security review program; collect SOC 2 Type II reports from all BAA vendors; create vendor risk tracking dashboard | HIPAA Security Officer |
| 3.5 | — | SRA-023 | 8 | Implement enhanced network segmentation (separate subnets for application, database, and management tiers); enable VPC Flow Logs with anomaly detection | Platform Engineering |

### Phase 4 — Long-Term (Complete by December 31, 2026)

| Item | Gap ID | Risk IDs | Risk Score | Action | Owner |
|------|--------|----------|------------|--------|-------|
| 4.1 | GAP-014 | SRA-019, SRA-026 | 4-5 | Design and test cross-region disaster recovery architecture; document RTO/RPO targets; conduct first DR drill | Platform Engineering |
| 4.2 | — | SRA-021 | 8 | Evaluate AWS Shield Advanced; implement auto-scaling policies for ECS; document DDoS response runbook | Platform Engineering |
| 4.3 | — | — | — | Begin SOC 2 Type I audit readiness assessment with external auditor | HIPAA Security Officer |
| 4.4 | — | — | — | Conduct second annual SRA; update risk register based on remediation progress and new threats | HIPAA Security Officer |

---

## 9. Risk Score Summary

### By Category

| Category | Risks | Avg Score | Highest Risk |
|----------|-------|-----------|--------------|
| Administrative | 6 | 9.7 | SRA-003 (15 — High) |
| Technical | 10 | 7.6 | SRA-007, SRA-009, SRA-010 (10 — Medium) |
| Physical | 3 | 6.3 | SRA-018 (9 — Medium) |
| Infrastructure | 5 | 10.0 | SRA-020, SRA-024 (12 — High) |
| Third-Party | 4 | 6.3 | SRA-028 (8 — Medium) |
| Application-Specific | 3 | 10.0 | SRA-030 (12 — High) |

### By Residual Risk Level

| Level | Count | Risk IDs |
|-------|-------|----------|
| High | 5 | SRA-003, SRA-006, SRA-020, SRA-024, SRA-030 |
| Medium | 25 | SRA-001, SRA-002, SRA-004, SRA-005, SRA-007, SRA-008, SRA-009, SRA-010, SRA-011, SRA-012, SRA-013, SRA-014, SRA-015, SRA-016, SRA-017, SRA-018, SRA-021, SRA-022, SRA-023, SRA-025, SRA-026, SRA-027, SRA-028, SRA-029, SRA-031 |
| Low | 1 | SRA-019 |
| Critical | 0 | — |

---

## 10. Assessment Conclusions

### Overall Risk Posture: MEDIUM

The Primus EHR platform has a solid security foundation with encryption at rest and in transit, role-based access control, audit logging, PHI log masking, WAF protection, and multi-tenant schema isolation. However, several important controls remain unimplemented:

**Top 5 Priorities:**

1. **Document Incident Response Plan** (SRA-003, Score: 15) — Without a formal IRP, the organization cannot guarantee compliance with HIPAA's 60-day breach notification requirement.

2. **Enforce MFA for clinical users** (SRA-009, Score: 10) — Single-factor authentication for users who access ePHI is a significant gap that auditors will flag.

3. **Implement automated vulnerability scanning in CI** (SRA-020, Score: 12) — The current dependency on Dependabot alone is insufficient; SAST, DAST, and container scanning are needed.

4. **Conduct penetration test** (SRA-007/008/010, Score: 10) — No external security testing has been performed. This is a standard audit expectation.

5. **Implement DLP controls** (SRA-030, Score: 12) — Bulk data exfiltration is possible for authenticated users with clinical access.

### Positive Findings

- AES-256-GCM encryption at rest with AWS KMS key management
- TLS 1.3 in transit
- Comprehensive audit logging with PHI masking (22 field types)
- Role-based access control with 8 distinct roles and `@PreAuthorize` enforcement
- WAFv2 with OWASP managed rules
- Multi-tenant schema isolation via Hibernate
- CSRF protection with SameSite cookies
- Rate limiting on authentication endpoints
- Infrastructure as Code (Terraform) ensuring reproducible, auditable deployments
- BAAs in place with all third-party vendors that handle ePHI

---

## 11. Approval Signatures

This Security Risk Assessment has been reviewed and approved by the following individuals:

| Role | Name | Signature | Date |
|------|------|-----------|------|
| HIPAA Security Officer | _________________________ | _________________________ | ____/____/________ |
| Chief Technology Officer | _________________________ | _________________________ | ____/____/________ |
| Chief Executive Officer | _________________________ | _________________________ | ____/____/________ |

---

## Appendix A: Regulatory References

| Regulation | Section | Requirement |
|-----------|---------|-------------|
| HIPAA Security Rule | 45 CFR 164.308(a)(1)(ii)(A) | Risk analysis (this document) |
| HIPAA Security Rule | 45 CFR 164.308(a)(1)(ii)(B) | Risk management |
| HIPAA Security Rule | 45 CFR 164.308(a)(5) | Security awareness and training |
| HIPAA Security Rule | 45 CFR 164.308(a)(6) | Security incident procedures |
| HIPAA Security Rule | 45 CFR 164.308(a)(7) | Contingency plan |
| HIPAA Security Rule | 45 CFR 164.308(a)(8) | Evaluation |
| HIPAA Security Rule | 45 CFR 164.310(a) | Facility access controls |
| HIPAA Security Rule | 45 CFR 164.310(d) | Device and media controls |
| HIPAA Security Rule | 45 CFR 164.312(a) | Access control |
| HIPAA Security Rule | 45 CFR 164.312(b) | Audit controls |
| HIPAA Security Rule | 45 CFR 164.312(c) | Integrity |
| HIPAA Security Rule | 45 CFR 164.312(d) | Person or entity authentication |
| HIPAA Security Rule | 45 CFR 164.312(e) | Transmission security |
| HIPAA Security Rule | 45 CFR 164.314(a) | Business associate contracts |
| HIPAA Security Rule | 45 CFR 164.316(a) | Policies and procedures |
| HITECH Act | Section 13402 | Breach notification requirements |
| NIST | SP 800-30 Rev. 1 | Guide for Conducting Risk Assessments |
| NIST | SP 800-66 Rev. 2 | Implementing the HIPAA Security Rule |

## Appendix B: Acronyms

| Acronym | Definition |
|---------|------------|
| BAA | Business Associate Agreement |
| CSRF | Cross-Site Request Forgery |
| DAST | Dynamic Application Security Testing |
| DLP | Data Loss Prevention |
| DR | Disaster Recovery |
| EPCS | Electronic Prescribing for Controlled Substances |
| ePHI | Electronic Protected Health Information |
| HIPAA | Health Insurance Portability and Accountability Act |
| HITECH | Health Information Technology for Economic and Clinical Health Act |
| IDOR | Insecure Direct Object Reference |
| IRP | Incident Response Plan |
| IRB | Institutional Review Board |
| KMS | Key Management Service |
| MDM | Mobile Device Management |
| MFA | Multi-Factor Authentication |
| NIST | National Institute of Standards and Technology |
| OIDC | OpenID Connect |
| OWASP | Open Worldwide Application Security Project |
| PHI | Protected Health Information |
| PKCE | Proof Key for Code Exchange |
| RLS | Row-Level Security |
| RPO | Recovery Point Objective |
| RTO | Recovery Time Objective |
| SAST | Static Application Security Testing |
| SRA | Security Risk Assessment |
| WAF | Web Application Firewall |
| WORM | Write Once Read Many |
| XSS | Cross-Site Scripting |

---

*This document is confidential and intended for internal use by Thinkitive Technologies and authorized auditors only. Do not distribute without approval from the HIPAA Security Officer.*
