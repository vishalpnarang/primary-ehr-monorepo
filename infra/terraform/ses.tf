# ---------------------------------------------------------------------------
# ses.tf — AWS Simple Email Service for Phase 8 notifications
#
# Resources:
#   - SES domain identity  (primus-ehr.com)
#   - SES email identity   (noreply@primus-ehr.com)
#   - SES configuration set (enables open/click/bounce/complaint tracking)
#   - IAM inline policy    (grants ECS task role ses:SendEmail permission)
#
# Cost: $0 for first 62,000 emails/month sent from EC2/ECS. After that
#   $0.10/1,000 emails. Demo usage is well within free tier.
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# SES Domain Identity
# AWS will require DNS verification (MX / TXT records) before sending.
# Add the DKIM and verification TXT records to your DNS provider using the
# outputs from this resource after first apply.
# ---------------------------------------------------------------------------
resource "aws_ses_domain_identity" "main" {
  domain = "primus-ehr.com"
}

# DKIM signing — generates three CNAME records that must be added to DNS
resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}

# ---------------------------------------------------------------------------
# SES Email Identity — the From address used by the Spring Boot backend
# ---------------------------------------------------------------------------
resource "aws_ses_email_identity" "sender" {
  email = var.ses_sender_email
}

# ---------------------------------------------------------------------------
# SES Configuration Set
# Enables event publishing (bounces, complaints, opens, clicks) for
# deliverability tracking. Attach to outbound emails via X-SES-CONFIGURATION-SET
# header or Spring Boot mail properties.
# ---------------------------------------------------------------------------
resource "aws_ses_configuration_set" "main" {
  name = "${local.name_prefix}-ses-config"

  # Reputation metrics: track bounce/complaint rates in CloudWatch
  reputation_metrics_enabled = true

  # Sending: enabled by default; can be toggled per configuration set
  sending_enabled = true
}

# CloudWatch event destination — routes bounce/complaint events to CW metrics
resource "aws_ses_event_destination" "cloudwatch" {
  name                   = "${local.name_prefix}-ses-cw-dest"
  configuration_set_name = aws_ses_configuration_set.main.name
  enabled                = true

  matching_types = [
    "send",
    "bounce",
    "complaint",
    "delivery",
  ]

  cloudwatch_destination {
    default_value  = "0"
    dimension_name = "SESEventType"
    value_source   = "messageTag"
  }
}

# ---------------------------------------------------------------------------
# IAM — inline policy on the ECS task role to allow sending via SES
# This is separate from the existing ecs_task_s3 policy to keep concerns clear.
# ---------------------------------------------------------------------------
resource "aws_iam_role_policy" "ecs_task_ses" {
  name = "${local.name_prefix}-ecs-task-ses"
  role = aws_iam_role.ecs_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowSESSend"
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail",
          "ses:SendTemplatedEmail",
        ]
        Resource = [
          aws_ses_domain_identity.main.arn,
          aws_ses_email_identity.sender.arn,
          # Configuration set ARN — required when specifying ConfigurationSetName
          "arn:aws:ses:${var.aws_region}:${data.aws_caller_identity.current.account_id}:configuration-set/${aws_ses_configuration_set.main.name}",
        ]
      }
    ]
  })
}

# ---------------------------------------------------------------------------
# Outputs
# ---------------------------------------------------------------------------
output "ses_domain_identity_arn" {
  description = "SES domain identity ARN — add DKIM CNAMEs from ses_dkim_tokens to DNS"
  value       = aws_ses_domain_identity.main.arn
}

output "ses_dkim_tokens" {
  description = "Three DKIM CNAME tokens — create these as DNS CNAME records for email authentication"
  value       = aws_ses_domain_dkim.main.dkim_tokens
}

output "ses_configuration_set_name" {
  description = "SES configuration set name — pass as X-SES-CONFIGURATION-SET header or Spring Boot property"
  value       = aws_ses_configuration_set.main.name
}

output "ses_sender_email" {
  description = "Verified SES sender email address"
  value       = aws_ses_email_identity.sender.email
}
