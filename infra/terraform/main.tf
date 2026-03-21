terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "primus-ehr"
      Environment = var.environment
      Instance    = var.instance_name
      ManagedBy   = "terraform"
    }
  }
}

# ---------------------------------------------------------------------------
# Locals — central name prefixes so every resource is consistently named
# and easy to identify in the AWS console.
# ---------------------------------------------------------------------------
locals {
  name_prefix = "primus-${var.environment}-${var.instance_name}"

  # Common tags merged with per-resource tags where needed
  common_tags = {
    Project     = "primus-ehr"
    Environment = var.environment
    Instance    = var.instance_name
    ManagedBy   = "terraform"
  }
}
