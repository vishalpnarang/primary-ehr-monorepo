# ---------------------------------------------------------------------------
# secrets.tf — AWS Secrets Manager
#
# All sensitive values land here instead of environment variables.
# ECS tasks retrieve secrets via secretsFrom in task definitions (no plaintext
# in ECS metadata or CloudWatch logs).
#
# Cost: $0.40/secret/month + $0.05/10,000 API calls. 3 secrets = ~$1.20/month.
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Database credentials — read by the Spring Boot backend at startup
# ---------------------------------------------------------------------------
resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "${local.name_prefix}/db-credentials"
  description             = "Aurora PostgreSQL master credentials for Primus EHR"
  recovery_window_in_days = 0 # Immediate deletion on destroy (demo — no recovery needed)

  tags = { Name = "${local.name_prefix}-secret-db" }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id

  secret_string = jsonencode({
    username = aws_rds_cluster.main.master_username
    password = var.db_password
    host     = aws_rds_cluster.main.endpoint
    port     = 5432
    dbname   = aws_rds_cluster.main.database_name
    # Full JDBC URL for Spring Boot datasource.url
    jdbc_url = "jdbc:postgresql://${aws_rds_cluster.main.endpoint}:5432/${aws_rds_cluster.main.database_name}"
  })
}

# ---------------------------------------------------------------------------
# Keycloak admin credentials — used during realm import and admin console
# ---------------------------------------------------------------------------
resource "aws_secretsmanager_secret" "keycloak_credentials" {
  name                    = "${local.name_prefix}/keycloak-credentials"
  description             = "Keycloak admin credentials for Primus EHR"
  recovery_window_in_days = 0

  tags = { Name = "${local.name_prefix}-secret-keycloak" }
}

resource "aws_secretsmanager_secret_version" "keycloak_credentials" {
  secret_id = aws_secretsmanager_secret.keycloak_credentials.id

  secret_string = jsonencode({
    admin_user     = var.keycloak_admin_user
    admin_password = var.keycloak_admin_password
    # Keycloak database — reuses the same Aurora cluster, separate DB schema
    db_user     = aws_rds_cluster.main.master_username
    db_password = var.db_password
    db_host     = aws_rds_cluster.main.endpoint
    db_name     = "keycloak"
  })
}

# ---------------------------------------------------------------------------
# Backend application secrets — JWT signing key and other app-level secrets
# ---------------------------------------------------------------------------
resource "aws_secretsmanager_secret" "backend_secrets" {
  name                    = "${local.name_prefix}/backend-secrets"
  description             = "Spring Boot application secrets for Primus EHR backend"
  recovery_window_in_days = 0

  tags = { Name = "${local.name_prefix}-secret-backend" }
}

resource "aws_secretsmanager_secret_version" "backend_secrets" {
  secret_id = aws_secretsmanager_secret.backend_secrets.id

  secret_string = jsonencode({
    jwt_secret        = var.backend_jwt_secret
    # Keycloak realm issuer URL — backend validates tokens against this
    keycloak_issuer   = "http://${aws_lb.main.dns_name}/auth/realms/primus"
    keycloak_jwks_uri = "http://${aws_lb.main.dns_name}/auth/realms/primus/protocol/openid-connect/certs"
    # Spring active profiles
    spring_profiles   = "demo,aws"
  })
}

# ---------------------------------------------------------------------------
# Outputs — ARNs used in ECS task definitions (secretsFrom)
# ---------------------------------------------------------------------------
output "secret_db_credentials_arn" {
  description = "ARN of the DB credentials secret — referenced in ECS task definition"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

output "secret_keycloak_credentials_arn" {
  description = "ARN of the Keycloak credentials secret"
  value       = aws_secretsmanager_secret.keycloak_credentials.arn
}

output "secret_backend_arn" {
  description = "ARN of the backend application secrets"
  value       = aws_secretsmanager_secret.backend_secrets.arn
}
