# ---------------------------------------------------------------------------
# outputs.tf — Final summary outputs printed after terraform apply
#
# These are what the operator reads to know where to go.
# deploy.sh captures these to present a clean summary at the end.
# ---------------------------------------------------------------------------

output "app_url" {
  description = "Primary application URL — provider portal (share with demo client)"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "patient_portal_url" {
  description = "Patient portal URL"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}/patient"
}

output "api_base_url" {
  description = "REST API base URL — all /api/* requests"
  value       = "http://${aws_lb.main.dns_name}/api"
}

output "keycloak_admin_url" {
  description = "Keycloak admin console — login with keycloak admin credentials"
  value       = "http://${aws_lb.main.dns_name}/auth/admin"
}

output "aws_region" {
  description = "AWS region where resources are deployed"
  value       = var.aws_region
}

output "instance_name" {
  description = "Demo instance name"
  value       = var.instance_name
}

# ---------------------------------------------------------------------------
# Phase 8 — Notifications
# ---------------------------------------------------------------------------

output "ses_domain_identity_arn" {
  description = "SES domain identity ARN — add DKIM CNAMEs to DNS to complete domain verification"
  value       = aws_ses_domain_identity.main.arn
}

output "sns_appointment_reminders_arn" {
  description = "SNS topic ARN for appointment reminder SMS — injected into backend as SNS_TOPIC_APPOINTMENT_REMINDERS"
  value       = aws_sns_topic.appointment_reminders.arn
}

output "sns_notification_dispatch_arn" {
  description = "SNS topic ARN for general notification dispatch — injected into backend as SNS_TOPIC_NOTIFICATION_DISPATCH"
  value       = aws_sns_topic.notification_dispatch.arn
}

# ---------------------------------------------------------------------------
# Phase 8 — File uploads
# ---------------------------------------------------------------------------

output "s3_uploads_bucket_name" {
  description = "S3 uploads bucket name — injected into backend as AWS_S3_UPLOADS_BUCKET"
  value       = aws_s3_bucket.uploads.id
}

output "s3_uploads_bucket_arn" {
  description = "S3 uploads bucket ARN"
  value       = aws_s3_bucket.uploads.arn
}

# ---------------------------------------------------------------------------
# Deployment summary
# ---------------------------------------------------------------------------

output "deployment_summary" {
  description = "Human-readable deployment summary — printed after apply completes"
  value = <<-EOT

    ============================================================
    Primus EHR — Demo Deployment Complete
    Instance : ${var.instance_name}
    Region   : ${var.aws_region}
    ============================================================

    PROVIDER PORTAL
      URL: https://${aws_cloudfront_distribution.frontend.domain_name}

    PATIENT PORTAL
      URL: https://${aws_cloudfront_distribution.frontend.domain_name}/patient

    API
      URL: http://${aws_lb.main.dns_name}/api

    KEYCLOAK
      URL:   http://${aws_lb.main.dns_name}/auth/admin
      User:  ${var.keycloak_admin_user}
      Pass:  (stored in Secrets Manager: ${aws_secretsmanager_secret.keycloak_credentials.name})

    DATABASE
      Host:  ${aws_rds_cluster.main.endpoint}
      DB:    ${aws_rds_cluster.main.database_name}
      Creds: (stored in Secrets Manager: ${aws_secretsmanager_secret.db_credentials.name})

    ECS CLUSTER
      Name: ${aws_ecs_cluster.main.name}

    NOTIFICATIONS (Phase 8)
      SES sender     : ${var.ses_sender_email}
      SES domain ARN : ${aws_ses_domain_identity.main.arn}
      SNS appt topic : ${aws_sns_topic.appointment_reminders.arn}
      SNS dispatch   : ${aws_sns_topic.notification_dispatch.arn}

    FILE UPLOADS (Phase 8)
      S3 bucket: ${aws_s3_bucket.uploads.id}

    TEAR DOWN
      cd infra && ./destroy.sh ${var.instance_name}

    ============================================================
  EOT
}
