# ---------------------------------------------------------------------------
# ecr.tf — Elastic Container Registry repositories
#
# One repo per container image. deploy.sh pushes images here before ECS
# can pull them.
#
# Cost: $0.10/GB/month storage. Demo images are typically < 500MB each,
# so cost is negligible. Images are deleted when the repo is destroyed.
# ---------------------------------------------------------------------------

resource "aws_ecr_repository" "backend" {
  name                 = "${local.name_prefix}/backend"
  image_tag_mutability = "MUTABLE" # Allow overwriting 'latest' tag during demos

  image_scanning_configuration {
    scan_on_push = true # Free basic scanning — catches known CVEs on every push
  }

  # Force delete on destroy removes all images so terraform destroy succeeds cleanly
  force_delete = true

  tags = { Name = "${local.name_prefix}-ecr-backend" }
}

resource "aws_ecr_repository" "keycloak" {
  name                 = "${local.name_prefix}/keycloak"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  force_delete = true

  tags = { Name = "${local.name_prefix}-ecr-keycloak" }
}

# ---------------------------------------------------------------------------
# Lifecycle policy — keep only the last 5 images per repo.
# Prevents storage cost accumulation across repeated demo deploys.
# ---------------------------------------------------------------------------
resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 5 images, expire older ones"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 5
        }
        action = { type = "expire" }
      }
    ]
  })
}

resource "aws_ecr_lifecycle_policy" "keycloak" {
  repository = aws_ecr_repository.keycloak.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 5 images, expire older ones"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 5
        }
        action = { type = "expire" }
      }
    ]
  })
}

# ---------------------------------------------------------------------------
# Outputs — used by deploy.sh to push images
# ---------------------------------------------------------------------------
output "ecr_backend_url" {
  description = "ECR repository URL for the Spring Boot backend image"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_keycloak_url" {
  description = "ECR repository URL for the Keycloak image"
  value       = aws_ecr_repository.keycloak.repository_url
}

output "ecr_registry" {
  description = "ECR registry host (account.dkr.ecr.region.amazonaws.com)"
  value       = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
}

# Used to build ECR URLs
data "aws_caller_identity" "current" {}
