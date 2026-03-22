# ---------------------------------------------------------------------------
# variables.tf — All configurable inputs for the Primus EHR demo deployment.
# Sensible defaults allow `terraform apply` to work with minimal input.
# Override via terraform.tfvars or -var flags on the CLI.
# ---------------------------------------------------------------------------

variable "aws_region" {
  description = "AWS region to deploy into. us-east-1 is cheapest for demo workloads."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment label (demo, staging, prod)."
  type        = string
  default     = "demo"

  validation {
    condition     = contains(["demo", "staging", "prod"], var.environment)
    error_message = "environment must be one of: demo, staging, prod."
  }
}

variable "instance_name" {
  description = "Unique slug for this demo instance (e.g. 'acme', 'primusdemo'). Used in resource names."
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.instance_name))
    error_message = "instance_name must be lowercase alphanumeric and hyphens only."
  }
}

variable "db_password" {
  description = "Master password for the Aurora PostgreSQL cluster. Stored in Secrets Manager."
  type        = string
  sensitive   = true
  default     = "PrimusDemo2026!"
}

variable "db_snapshot_identifier" {
  description = "RDS cluster snapshot ID to restore from. Leave empty for fresh DB with seed data."
  type        = string
  default     = ""
}

variable "domain_name" {
  description = "Optional custom domain (e.g. demo.yourcompany.com). Leave empty to use ALB/CloudFront URLs."
  type        = string
  default     = ""
}

# ---------------------------------------------------------------------------
# ECS sizing — kept small for demo cost. Adjust for staging/prod.
# Cost estimate at these sizes: ~$30-60/month for 24/7, $0 when destroyed.
# ---------------------------------------------------------------------------

variable "backend_cpu" {
  description = "Fargate CPU units for the Spring Boot backend task (1024 = 1 vCPU)."
  type        = number
  default     = 512
}

variable "backend_memory" {
  description = "Fargate memory (MB) for the Spring Boot backend task."
  type        = number
  default     = 1024
}

variable "keycloak_cpu" {
  description = "Fargate CPU units for the Keycloak task."
  type        = number
  default     = 512
}

variable "keycloak_memory" {
  description = "Fargate memory (MB) for the Keycloak task."
  type        = number
  default     = 1024
}

variable "keycloak_admin_user" {
  description = "Keycloak admin console username."
  type        = string
  default     = "admin"
}

variable "keycloak_admin_password" {
  description = "Keycloak admin console password. Stored in Secrets Manager."
  type        = string
  sensitive   = true
  default     = "KeycloakAdmin2026!"
}

variable "backend_jwt_secret" {
  description = "JWT signing secret for the Spring Boot backend. Stored in Secrets Manager."
  type        = string
  sensitive   = true
  default     = "primus-jwt-secret-change-in-prod-2026!"
}

# ---------------------------------------------------------------------------
# Phase 8 — Notifications (SES + SNS)
# ---------------------------------------------------------------------------

variable "ses_sender_email" {
  description = "Verified SES sender address used by the backend for all outbound email (appointment reminders, password resets, etc.)."
  type        = string
  default     = "noreply@primus-ehr.com"
}

variable "sns_sms_spend_limit" {
  description = "Monthly SMS spend limit in USD for the AWS SNS account-level SMS preferences. Prevents runaway costs on demo deployments."
  type        = number
  default     = 100
}

# ---------------------------------------------------------------------------
# Phase 8 — File uploads (S3)
# ---------------------------------------------------------------------------

variable "uploads_bucket_name" {
  description = "Base name for the S3 uploads bucket (message attachments, patient documents). A unique suffix is appended automatically."
  type        = string
  default     = "primus-uploads"
}
