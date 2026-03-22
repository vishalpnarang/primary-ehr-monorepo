# ---------------------------------------------------------------------------
# sns.tf — AWS SNS for Phase 8 SMS notifications
#
# Resources:
#   - SNS topic: appointment-reminders  (targeted patient SMS)
#   - SNS topic: notification-dispatch  (general internal dispatch fan-out)
#   - SNS SMS account-level preferences (Transactional type, spend cap)
#   - IAM inline policy (grants ECS task role sns:Publish to both topics)
#
# Cost: $0.00645/SMS (USA). At 1,000 SMS/month = ~$6.45.
#   Demo usage is typically < 100 SMS/month = < $1.
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# SNS Topic — Appointment Reminders
# Spring Boot publishes to this topic; Lambda/SQS consumers can subscribe.
# ---------------------------------------------------------------------------
resource "aws_sns_topic" "appointment_reminders" {
  name         = "${local.name_prefix}-appointment-reminders"
  display_name = "Primus Appointment Reminders"

  # KMS encryption at rest — uses AWS-managed key (free)
  # Swap for aws_kms_key.main.arn in prod for HIPAA BAA key management
  kms_master_key_id = "alias/aws/sns"

  tags = { Name = "${local.name_prefix}-appointment-reminders" }
}

# ---------------------------------------------------------------------------
# SNS Topic — General Notification Dispatch
# Fan-out hub for all other notification types (lab results, messages, etc.)
# ---------------------------------------------------------------------------
resource "aws_sns_topic" "notification_dispatch" {
  name         = "${local.name_prefix}-notification-dispatch"
  display_name = "Primus Notification Dispatch"

  kms_master_key_id = "alias/aws/sns"

  tags = { Name = "${local.name_prefix}-notification-dispatch" }
}

# ---------------------------------------------------------------------------
# SNS SMS Preferences — account-level settings
# Sets message type to Transactional (higher deliverability, no marketing opt-out)
# and enforces a spend cap to prevent runaway costs on demo deployments.
#
# Note: aws_sns_sms_preferences is a singleton resource — it configures the
# AWS account, not a specific topic. Only one instance should exist per account.
# ---------------------------------------------------------------------------
resource "aws_sns_sms_preferences" "main" {
  default_sender_id      = "Primus"       # Displayed as sender on supported carriers
  default_sms_type       = "Transactional" # Transactional = higher priority than Promotional
  monthly_spend_limit    = var.sns_sms_spend_limit
  usage_report_s3_bucket = "" # Disable usage reports to avoid extra S3 bucket cost on demo
}

# ---------------------------------------------------------------------------
# IAM — inline policy on the ECS task role to allow SNS publish
# ---------------------------------------------------------------------------
resource "aws_iam_role_policy" "ecs_task_sns" {
  name = "${local.name_prefix}-ecs-task-sns"
  role = aws_iam_role.ecs_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowSNSPublish"
        Effect = "Allow"
        Action = [
          "sns:Publish",
          "sns:GetTopicAttributes",
        ]
        Resource = [
          aws_sns_topic.appointment_reminders.arn,
          aws_sns_topic.notification_dispatch.arn,
        ]
      },
      {
        Sid    = "AllowSNSSMSDirect"
        Effect = "Allow"
        Action = [
          "sns:Publish",          # For direct-to-phone-number SMS (no topic needed)
        ]
        Resource = "*"            # Direct SMS publish requires * — no specific topic ARN
        Condition = {
          StringEquals = {
            "sns:Protocol" = "sms"
          }
        }
      }
    ]
  })
}

# ---------------------------------------------------------------------------
# Outputs
# ---------------------------------------------------------------------------
output "sns_appointment_reminders_arn" {
  description = "SNS topic ARN for appointment reminders — set as NOTIFICATIONS_TOPIC_APPT_ARN env var in backend"
  value       = aws_sns_topic.appointment_reminders.arn
}

output "sns_notification_dispatch_arn" {
  description = "SNS topic ARN for general notification dispatch — set as NOTIFICATIONS_TOPIC_DISPATCH_ARN env var in backend"
  value       = aws_sns_topic.notification_dispatch.arn
}
