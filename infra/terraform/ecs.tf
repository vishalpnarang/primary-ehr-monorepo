# ---------------------------------------------------------------------------
# ecs.tf — ECS Cluster and Fargate services for backend + Keycloak
#
# Services:
#   - primus-backend  : Spring Boot 3, Java 21, port 8080
#   - primus-keycloak : Keycloak 24, port 8080
#
# Cost (Fargate, us-east-1, demo sizes):
#   - backend  : 0.5 vCPU / 1 GB   ≈ $0.019/hr  ≈ $14/month
#   - keycloak : 0.5 vCPU / 1 GB   ≈ $0.019/hr  ≈ $14/month
#   Total ECS: ~$28/month for 24/7 demo. $0 after terraform destroy.
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# ECS Cluster
# ---------------------------------------------------------------------------
resource "aws_ecs_cluster" "main" {
  name = "${local.name_prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled" # Enabled for production observability (CPU, memory, network metrics)
  }

  tags = { Name = "${local.name_prefix}-cluster" }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
    base              = 1
  }
}

# ---------------------------------------------------------------------------
# CloudWatch Log Groups — one per service
# Retention 2192 days (6 years) — HIPAA requires audit logs retained for 6 years.
# ---------------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${local.name_prefix}/backend"
  retention_in_days = 2192
  tags              = { Name = "${local.name_prefix}-logs-backend" }
}

resource "aws_cloudwatch_log_group" "keycloak" {
  name              = "/ecs/${local.name_prefix}/keycloak"
  retention_in_days = 2192
  tags              = { Name = "${local.name_prefix}-logs-keycloak" }
}

# ---------------------------------------------------------------------------
# IAM — Task Execution Role
# Allows ECS agent to pull ECR images and write CloudWatch logs.
# ---------------------------------------------------------------------------
resource "aws_iam_role" "ecs_task_execution" {
  name = "${local.name_prefix}-ecs-task-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "ecs-tasks.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })

  tags = { Name = "${local.name_prefix}-ecs-task-execution" }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_managed" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Additional policy: allow reading from Secrets Manager (for secretsFrom)
resource "aws_iam_role_policy" "ecs_task_execution_secrets" {
  name = "${local.name_prefix}-ecs-exec-secrets"
  role = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "kms:Decrypt" # If secrets are KMS-encrypted
        ]
        Resource = [
          aws_secretsmanager_secret.db_credentials.arn,
          aws_secretsmanager_secret.keycloak_credentials.arn,
          aws_secretsmanager_secret.backend_secrets.arn,
        ]
      }
    ]
  })
}

# ---------------------------------------------------------------------------
# IAM — Task Role
# The role assumed BY the running container (not the agent).
# Add S3, Secrets Manager, SES, etc. permissions here as the app needs them.
# ---------------------------------------------------------------------------
resource "aws_iam_role" "ecs_task" {
  name = "${local.name_prefix}-ecs-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "ecs-tasks.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })

  tags = { Name = "${local.name_prefix}-ecs-task" }
}

resource "aws_iam_role_policy" "ecs_task_s3" {
  name = "${local.name_prefix}-ecs-task-s3"
  role = aws_iam_role.ecs_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # Frontend bucket — read-only (backend may serve asset URLs)
      {
        Sid      = "FrontendS3ReadOnly"
        Effect   = "Allow"
        Action   = ["s3:GetObject"]
        Resource = "${aws_s3_bucket.frontend.arn}/*"
      },
      # Uploads bucket — full read/write for patient documents and attachments
      # (ses.tf/s3_uploads.tf also attach separate policies; this policy covers
      #  the core S3 access the task role needs at the IAM level)
      {
        Sid    = "UploadsS3ReadWrite"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:GetObjectVersion",
          "s3:ListBucket",
        ]
        Resource = [
          aws_s3_bucket.uploads.arn,
          "${aws_s3_bucket.uploads.arn}/*",
        ]
      },
      # Secrets Manager — backend reads credentials at startup
      {
        Sid    = "SecretsManagerRead"
        Effect = "Allow"
        Action = ["secretsmanager:GetSecretValue"]
        Resource = [
          aws_secretsmanager_secret.db_credentials.arn,
          aws_secretsmanager_secret.backend_secrets.arn,
        ]
      },
      # SES — send email notifications (appointment reminders, lab results, messages)
      {
        Sid    = "SESSendEmail"
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail",
          "ses:SendTemplatedEmail",
        ]
        Resource = "*" # Scoped further by ses.tf policy; "*" needed for identity ARN wildcard
      },
      # SNS — publish SMS notifications and internal dispatch events
      {
        Sid    = "SNSPublish"
        Effect = "Allow"
        Action = [
          "sns:Publish",
          "sns:GetTopicAttributes",
        ]
        Resource = "*" # Topic ARNs not yet known at ecs.tf parse time; sns.tf adds scoped policy
      }
    ]
  })
}

# ---------------------------------------------------------------------------
# Task Definition — Spring Boot Backend
# ---------------------------------------------------------------------------
resource "aws_ecs_task_definition" "backend" {
  family                   = "${local.name_prefix}-backend"
  network_mode             = "awsvpc"  # Required for Fargate
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.backend_cpu
  memory                   = var.backend_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = "${aws_ecr_repository.backend.repository_url}:latest"
      essential = true

      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
          protocol      = "tcp"
        }
      ]

      # Environment — non-sensitive config only. Secrets come from secretsFrom below.
      environment = [
        { name = "SPRING_PROFILES_ACTIVE", value = "demo,aws" },
        { name = "SERVER_PORT",            value = "8080" },
        { name = "DB_HOST",                value = aws_rds_cluster.main.endpoint },
        { name = "DB_PORT",                value = "5432" },
        { name = "DB_NAME",                value = aws_rds_cluster.main.database_name },
        { name = "AWS_REGION",             value = var.aws_region },
        # Phase 8 — Notifications
        { name = "SES_SENDER_EMAIL",                  value = var.ses_sender_email },
        { name = "SES_CONFIGURATION_SET",             value = "${local.name_prefix}-ses-config" },
        { name = "SNS_TOPIC_APPOINTMENT_REMINDERS",   value = aws_sns_topic.appointment_reminders.arn },
        { name = "SNS_TOPIC_NOTIFICATION_DISPATCH",   value = aws_sns_topic.notification_dispatch.arn },
        # Phase 8 — File uploads
        { name = "AWS_S3_UPLOADS_BUCKET",             value = aws_s3_bucket.uploads.id },
      ]

      # Secrets — injected as environment variables at runtime from Secrets Manager.
      # Never appear in ECS console, CloudWatch logs, or task metadata.
      secrets = [
        {
          name      = "DB_PASSWORD"
          valueFrom = "${aws_secretsmanager_secret.db_credentials.arn}:password::"
        },
        {
          name      = "DB_USERNAME"
          valueFrom = "${aws_secretsmanager_secret.db_credentials.arn}:username::"
        },
        {
          name      = "JWT_SECRET"
          valueFrom = "${aws_secretsmanager_secret.backend_secrets.arn}:jwt_secret::"
        },
        {
          name      = "KEYCLOAK_ISSUER_URI"
          valueFrom = "${aws_secretsmanager_secret.backend_secrets.arn}:keycloak_issuer::"
        },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "backend"
        }
      }

      # Health check — Spring Boot Actuator endpoint
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8080/actuator/health || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 60 # Spring Boot startup can take up to 60s on cold start
      }
    }
  ])

  tags = { Name = "${local.name_prefix}-task-backend" }
}

# ---------------------------------------------------------------------------
# Task Definition — Keycloak 24
# ---------------------------------------------------------------------------
resource "aws_ecs_task_definition" "keycloak" {
  family                   = "${local.name_prefix}-keycloak"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.keycloak_cpu
  memory                   = var.keycloak_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "keycloak"
      image     = "${aws_ecr_repository.keycloak.repository_url}:latest"
      essential = true

      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
          protocol      = "tcp"
        }
      ]

      # Keycloak 24 starts in production mode with these env vars.
      # KC_PROXY=edge tells Keycloak it is behind the ALB (HTTP termination).
      environment = [
        { name = "KC_DB",                 value = "postgres" },
        { name = "KC_DB_URL_HOST",        value = aws_rds_cluster.main.endpoint },
        { name = "KC_DB_URL_DATABASE",    value = "keycloak" },
        { name = "KC_DB_URL_PORT",        value = "5432" },
        { name = "KC_PROXY",              value = "edge" },
        { name = "KC_HOSTNAME_STRICT",    value = "false" },
        { name = "KC_HTTP_ENABLED",       value = "true" },
        { name = "KC_HEALTH_ENABLED",     value = "true" },
        { name = "KC_METRICS_ENABLED",    value = "false" },
        # Relative path so Keycloak is reachable at /auth on the ALB
        { name = "KC_HTTP_RELATIVE_PATH", value = "/auth" },
      ]

      secrets = [
        {
          name      = "KC_DB_USERNAME"
          valueFrom = "${aws_secretsmanager_secret.keycloak_credentials.arn}:db_user::"
        },
        {
          name      = "KC_DB_PASSWORD"
          valueFrom = "${aws_secretsmanager_secret.keycloak_credentials.arn}:db_password::"
        },
        {
          name      = "KEYCLOAK_ADMIN"
          valueFrom = "${aws_secretsmanager_secret.keycloak_credentials.arn}:admin_user::"
        },
        {
          name      = "KEYCLOAK_ADMIN_PASSWORD"
          valueFrom = "${aws_secretsmanager_secret.keycloak_credentials.arn}:admin_password::"
        },
      ]

      # Keycloak start command — production mode with optimized build
      command = ["start", "--optimized"]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.keycloak.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "keycloak"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8080/auth/health/ready || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 5
        startPeriod = 120 # Keycloak first-boot DB migration can take ~2 minutes
      }
    }
  ])

  tags = { Name = "${local.name_prefix}-task-keycloak" }
}

# ---------------------------------------------------------------------------
# ECS Service — Backend
# ---------------------------------------------------------------------------
resource "aws_ecs_service" "backend" {
  name            = "${local.name_prefix}-svc-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  # Replace the running task before draining to minimize downtime during deploys
  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent         = 200

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false # Private subnet + NAT for outbound
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 8080
  }

  depends_on = [
    aws_lb_listener.https,
    aws_iam_role_policy_attachment.ecs_task_execution_managed,
  ]

  tags = { Name = "${local.name_prefix}-svc-backend" }
}

# ---------------------------------------------------------------------------
# ECS Service — Keycloak
# ---------------------------------------------------------------------------
resource "aws_ecs_service" "keycloak" {
  name            = "${local.name_prefix}-svc-keycloak"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.keycloak.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent         = 200

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.keycloak.arn
    container_name   = "keycloak"
    container_port   = 8080
  }

  depends_on = [
    aws_lb_listener.https,
    aws_iam_role_policy_attachment.ecs_task_execution_managed,
  ]

  tags = { Name = "${local.name_prefix}-svc-keycloak" }
}

# ---------------------------------------------------------------------------
# Outputs
# ---------------------------------------------------------------------------
output "ecs_cluster_name" {
  description = "ECS cluster name — use with `aws ecs list-tasks` to inspect running tasks"
  value       = aws_ecs_cluster.main.name
}

output "ecs_backend_service" {
  description = "ECS backend service name"
  value       = aws_ecs_service.backend.name
}

output "ecs_keycloak_service" {
  description = "ECS Keycloak service name"
  value       = aws_ecs_service.keycloak.name
}
