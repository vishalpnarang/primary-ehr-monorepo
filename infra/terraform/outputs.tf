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

    TEAR DOWN
      cd infra && ./destroy.sh ${var.instance_name}

    ============================================================
  EOT
}
