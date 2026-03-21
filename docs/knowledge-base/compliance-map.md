# Compliance Map — Primus EHR

## Applicable Regulations

| Regulation | Status | Notes |
|------------|--------|-------|
| HIPAA Security Rule | Required from Phase 1 | Full compliance; BAA with all vendors |
| HIPAA Privacy Rule | Required from Phase 1 | PHI access controls, minimum necessary |
| HIPAA Breach Notification | Phase 10 | Detection + 60-day notification workflow |
| WCAG 2.1 Level AA | Patient portal: required by May 11, 2026 | HHS 2024 rule |
| No Surprises Act | Phase 6 | Good Faith Estimate generation |
| SOC 2 Type II | Phase 10 | Required for enterprise sales |
| DEA EPCS Rules | Phase 5 | Drummond Group audit before go-live |
| 42 CFR Part 2 | Phase 5 | Substance abuse records extra protections |
| ONC HTI-1 / USCDI v3 | Phase 10 | FHIR R4 Patient Access APIs |
| CMS Prior Auth (DaVinci PAS) | Phase 10 | FHIR-based, mandated Jan 2027 |

## HIPAA Safeguards

### Administrative
- [ ] RBAC via Keycloak (8 roles, detailed permission matrix)
- [ ] MFA required for all clinical staff (TOTP via Keycloak)
- [ ] Session timeouts per role (15-30 min idle, 4-8h max)
- [ ] User impersonation with audit trail (Super Admin only)
- [ ] 7-year audit log retention

### Technical
- [ ] Encryption at rest: AES-256 (Aurora + S3)
- [ ] Encryption in transit: TLS 1.2+ (ALB + CloudFront)
- [ ] Row-Level Security: PostgreSQL RLS on all tenant-scoped tables
- [ ] JWT access tokens: 15-min lifetime, RS256 signed
- [ ] Geo-restriction: US only + Thinkitive IP allowlist (WAF)
- [ ] Rate limiting: 2,000 req/5min/IP (WAF v2)
- [ ] No public IPs on backend services
- [ ] VPC endpoints for AWS services (no NAT for sensitive traffic)

### Physical
- [ ] AWS infrastructure (SOC 2 + HIPAA eligible services)
- [ ] Bastion via SSM Session Manager only (no SSH keys)

## PHI Data Flow Rules

| Channel | PHI Allowed? | Rule |
|---------|-------------|------|
| Application UI (authenticated) | Yes | Full clinical data |
| SMS (Twilio) | **No** | Notification only — "Your results are ready" |
| Email (SES) | **No** | Notification only — portal link |
| Push notifications | **No** | Generic alerts only |
| Audit log | Yes (system-only) | Immutable, 7-year retention |
| Sentry (self-hosted) | Yes | Self-hosted = no 3rd party PHI exposure |
| CloudWatch logs | Limited | 7-day retention, no PHI in log messages |

## Audit Logging

| Event | Logged? | Retention |
|-------|---------|-----------|
| PHI access (read) | Yes | 7 years |
| PHI modification (write) | Yes | 7 years |
| Login/logout | Yes | 7 years |
| Failed login | Yes | 7 years |
| Role/permission change | Yes | 7 years |
| User impersonation | Yes | 7 years |
| Critical lab acknowledgment | Yes | 7 years |
| Prescription signing | Yes | 7 years |
| Claim submission | Yes | 7 years |
| Patient data export | Yes | 7 years |

## Vendor BAA Status

| Vendor | BAA Required | Status |
|--------|-------------|--------|
| AWS | Yes | Available (HIPAA eligible services) |
| Stripe | Yes | Healthcare Add-on |
| Twilio | Yes | HIPAA-eligible services |
| ScriptSure | Yes | At contract signing |
| Quest Diagnostics | Yes | At contract signing |
| Availity | Yes | At contract signing |
| Amazon Chime SDK | Yes | Available |

## Accessibility (WCAG 2.1 AA)

### Patient Portal (legally required)
- Color contrast: 4.5:1 normal text, 3:1 large text
- All form inputs labeled (`<label>` or `aria-label`)
- All icons have `aria-hidden="true"` with sibling text
- Focus visible (2px outline), focus trapped in modals
- No strobing (max 3 flashes/second)
- `prefers-reduced-motion` respected
- Screen reader: `aria-live` regions for dynamic content
- Tables: proper `<th scope>` and `<caption>`

### Provider Portal (recommended, same standards)
- Same WCAG AA standards applied
- Keyboard shortcuts for all common actions
- Tab navigation through all interactive elements

## Security Architecture

```
Internet → WAF v2 (OWASP rules + geo-restriction + rate limit)
         → ALB (TLS termination)
         → ECS Fargate (private subnet)
         → Aurora PostgreSQL (private subnet, RLS enforced)
```

- No direct public internet access to any backend service
- CloudTrail: 7-year log retention for all API activity
- Secrets Manager: All credentials, rotated per vendor schedule
- Developer access: SSM Session Manager or Client VPN only
