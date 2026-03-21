# Deployment Strategy — Primus EHR

**Philosophy:** Start as small and cheap as possible. Scale architecture only when it's actually needed. Every infrastructure decision should be reversible or evolutionarily additive.

---

## Phase 0–1: Local Development

**Cost: $0/month**

```yaml
# docker-compose.yml — entire dev stack
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: primus_dev
      POSTGRES_USER: primus
      POSTGRES_PASSWORD: devpassword

  keycloak:
    image: quay.io/keycloak/keycloak:24.0
    ports: ["8180:8080"]
    command: start-dev
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin

  jitsi:
    image: jitsi/jitsi-meet
    ports: ["8443:8443", "10000:10000/udp"]

  mailhog:
    image: mailhog/mailhog
    ports: ["8025:8025"]   # Web UI for email testing
    
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]   # Future use for sessions/caching
```

Developer access: all services on localhost. No AWS costs.

---

## Phase 1–3: MVP Staging (Pre-Production)

**Target cost: ~$150–200/month**

Single-server deployment on AWS for the client to test. Minimum viable AWS footprint.

```
Architecture:
┌─────────────────────────────────────────┐
│  AWS (us-east-1)                        │
│                                         │
│  Route 53 → ALB                         │
│                                         │
│  1x EC2 t3.medium ($30/mo)              │
│  ├── Spring Boot monolith (jar)         │
│  ├── Keycloak 24 (Docker)               │
│  └── Nginx (reverse proxy)             │
│                                         │
│  Aurora Serverless v2 (~$30/mo idle)   │
│  S3 + CloudFront ($5/mo)               │
│  SQS ($1/mo)                           │
│  Secrets Manager ($5/mo)               │
│  CloudWatch Logs ($10/mo)              │
│  WAF Basic ($10/mo)                    │
│                                         │
│  Total: ~$150-200/mo                   │
└─────────────────────────────────────────┘
```

**Justification for EC2 vs ECS in early phases:**
- Single EC2 instance is simpler to debug, SSH into, manage for early-stage product
- No ECS task definition complexity
- Same monolith JAR deployed via GitHub Actions → SSH → restart service
- Move to ECS Fargate when ready to scale to multiple instances

**Domain setup:**
- `app.primusehr.com` → Provider portal (CloudFront → S3)
- `my.primusehr.com` → Patient portal (CloudFront → S3)
- `api.primusehr.com` → Spring Boot (ALB → EC2)
- `auth.primusehr.com` → Keycloak (ALB → EC2, same instance)

---

## Phase 4–6: Production (First Real Client)

**Target cost: ~$500–700/month**

Move to ECS Fargate when load justifies it and before first production client.

```
Architecture:
┌──────────────────────────────────────────────┐
│  AWS (us-east-1)                             │
│                                              │
│  Route 53 → WAF v2 → ALB                    │
│                                              │
│  ECS Fargate (private subnet)               │
│  ├── primus-backend (1 task, scale to 3)    │
│  └── primus-keycloak (1 task, scale to 2)   │
│                                              │
│  Aurora PostgreSQL 16 Serverless v2          │
│  ├── 0.5–8 ACU auto-scaling                 │
│  └── Multi-AZ for production                │
│                                              │
│  S3 + CloudFront (frontends + assets)       │
│  SQS + DLQ (all async queues)               │
│  Secrets Manager + Parameter Store          │
│  CloudTrail (7-year, HIPAA)                 │
│  Grafana + Loki + Tempo (monitoring)        │
│  Sentry self-hosted (exception tracking)    │
│                                              │
│  Total: ~$500-700/mo                        │
└──────────────────────────────────────────────┘
```

**ECS Fargate sizing (production):**
- `primus-backend`: 1 vCPU, 2GB RAM per task (scale 1→3 on CPU > 70%)
- `primus-keycloak`: 0.5 vCPU, 1GB RAM per task (scale 1→2)
- Task placement: private subnets only; ALB in public subnet

---

## Phase 7–10: Multi-Tenant SaaS

**Target cost: ~$1,000–2,000/month (5–10 tenants)**

At this point, move to proper multi-environment setup matching Primus Demo Clinic reference:

```
Environments:
├── dev    } shared VPC, shared ALB, shared Aurora cluster
├── qa     }   (isolated by DB schema: primus_dev, primus_qa)
├── stage  → dedicated VPC, dedicated Aurora
└── prod   → dedicated VPC, dedicated Aurora (Multi-AZ)
```

**Microservices extraction (when needed):**

The DDD monolith packages map directly to future microservices:

| Package | Future service | Extract when |
|---------|---------------|-------------|
| `billing` | Billing Service | Billing team grows, or billing load is high |
| `notification` | Notification Service | High notification volume (SMS/email) |
| `integration` | Integration Service | HL7/FHIR complexity grows |
| `telehealth` | Telehealth Service | Video scaling needed |
| `analytics` | Analytics Service | Complex reporting load |

**Rule:** Don't extract until you feel the pain. The monolith with DDD packages handles Primus Demo Clinic scale easily (3–4 clinics, ~50 providers). Extract only when:
1. A specific domain has dramatically different scaling needs, OR
2. A team of 3+ engineers works exclusively on one domain, OR
3. A module needs different deployment frequency from the rest

---

## CI/CD Pipeline

```
GitHub Actions workflow:

on: push to main (prod), push to develop (dev/qa)

jobs:
  test:
    - Run JUnit tests (Spring Boot)
    - Run Vitest tests (React)
    - SonarCloud analysis
    
  build:
    - Build Spring Boot JAR (Maven)
    - Build React apps (Vite)
    - Build Docker image (Spring Boot JAR → ECR)
    - Push React builds to S3 (with CloudFront invalidation)
    
  migrate:
    - Run Liquibase migrations against target environment
    - If migration fails → pipeline stops, no deploy
    
  deploy:
    - Update ECS task definition with new image tag
    - ECS rolling deployment (circuit breaker on)
    - Health check: ALB target group healthy status
    - Auto-rollback on failure
    
  notify:
    - Slack notification: deploy success/failure + commit message
```

---

## Backup and Disaster Recovery

| Data | Backup frequency | Retention | Storage |
|------|-----------------|-----------|---------|
| Aurora (continuous PITR) | Continuous | 7 days | Aurora automated |
| Aurora (nightly snapshot) | Daily | 35 days | Aurora automated |
| Aurora (monthly snapshot) | Monthly | 7 years | S3 Glacier (HIPAA) |
| S3 (patient documents) | Continuous replication | Indefinite | S3 cross-region |
| Keycloak config | Exported nightly | 30 days | S3 |
| CloudTrail logs | Continuous | 7 years | S3 Standard → Glacier |

**Recovery targets (production):**
- RPO: 5 minutes (Aurora continuous backup)
- RTO: 1 hour (Multi-AZ failover + ECS auto-recovery)

---

## Networking (Production)

```
Public subnets:  ALB, NAT Gateway (1 AZ)
Private subnets: ECS tasks, Aurora, Keycloak

VPC Endpoints (saves NAT costs):
- S3 Gateway endpoint
- SQS Interface endpoint
- Secrets Manager Interface endpoint
- SSM Interface endpoint
- ECR Interface endpoints (dkr + api)
- CloudWatch Interface endpoint

Bastion: SSM Session Manager only — no SSH keys anywhere
Developer access: Client VPN (AWS Client VPN or Tailscale)
```

**Security (same as Primus Demo Clinic):**
- WAF: OWASP Core Rule Set, SQL injection, XSS, path traversal
- Geo-restriction: US only + Thinkitive office IPs allowlisted
- Rate limiting: 2,000 req/5min/IP (WAF)
- No public IPs on any backend services
- All secrets in Secrets Manager; no hardcoded credentials anywhere
