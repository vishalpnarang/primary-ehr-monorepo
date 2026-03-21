#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# destroy.sh — Primus EHR demo teardown
#
# Usage:
#   ./destroy.sh <instance-name> [aws-region]
#   ./destroy.sh demo-acme
#   ./destroy.sh demo-primusdemo us-west-2
#
# What this does:
#   1. Confirm intent (interactive prompt unless CI=true)
#   2. Empty the S3 bucket (Terraform cannot destroy non-empty S3 buckets
#      unless force_destroy = true, which is already set — but explicit
#      emptying is faster and avoids object version conflicts)
#   3. terraform destroy — removes every resource created by terraform apply
#   4. Clean up any lingering ECR images (belt-and-suspenders)
#
# After completion:
#   - All ECS tasks stopped: $0/hour
#   - Aurora cluster deleted: $0/hour
#   - NAT gateway released: $0/hour
#   - S3 bucket emptied and deleted: $0
#   - CloudFront distribution disabled and deleted: $0
#   - Secrets Manager secrets deleted (immediate, no recovery window): $0
#
# Cost AFTER destroy: $0 (no persistent resources remain)
# ---------------------------------------------------------------------------

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TF_DIR="${SCRIPT_DIR}/terraform"

INSTANCE_NAME="${1:-}"
AWS_REGION="${2:-us-east-1}"
CI="${CI:-false}" # Set to true in CI pipelines to skip confirmation prompt

# ---------------------------------------------------------------------------
# Colors and logging
# ---------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

log()    { echo -e "${BLUE}[destroy]${NC} $*"; }
success(){ echo -e "${GREEN}[destroy]${NC} $*"; }
warn()   { echo -e "${YELLOW}[destroy]${NC} $*"; }
error()  { echo -e "${RED}[destroy] ERROR:${NC} $*" >&2; }
die()    { error "$*"; exit 1; }

# ---------------------------------------------------------------------------
# Validate input
# ---------------------------------------------------------------------------
if [[ -z "${INSTANCE_NAME}" ]]; then
  cat <<-EOF

  ${BOLD}Primus EHR — Demo Teardown${NC}

  Usage: ./destroy.sh <instance-name> [aws-region]

  Examples:
    ./destroy.sh demo-acme
    ./destroy.sh demo-primusdemo us-west-2

  This will permanently delete ALL AWS resources for the specified instance.
  Cost after completion: \$0.

EOF
  exit 1
fi

# ---------------------------------------------------------------------------
# Safety confirmation
# ---------------------------------------------------------------------------
if [[ "${CI}" != "true" ]]; then
  echo ""
  echo -e "${RED}${BOLD}WARNING: This will permanently destroy ALL AWS resources for:${NC}"
  echo -e "  Instance : ${BOLD}${INSTANCE_NAME}${NC}"
  echo -e "  Region   : ${AWS_REGION}"
  echo ""
  echo "Resources that will be deleted:"
  echo "  - ECS cluster + all running tasks"
  echo "  - Aurora Serverless v2 cluster + all data"
  echo "  - Application Load Balancer"
  echo "  - CloudFront distribution"
  echo "  - S3 bucket + all frontend files"
  echo "  - ECR repositories + all Docker images"
  echo "  - Secrets Manager secrets"
  echo "  - VPC, subnets, NAT gateway, security groups"
  echo ""
  read -r -p "Type the instance name to confirm destruction: " CONFIRM
  if [[ "${CONFIRM}" != "${INSTANCE_NAME}" ]]; then
    echo "Confirmation did not match. Aborting."
    exit 1
  fi
fi

# ---------------------------------------------------------------------------
# Validate prerequisites
# ---------------------------------------------------------------------------
log "Checking prerequisites..."
command -v aws       &>/dev/null || die "aws CLI not found."
command -v terraform &>/dev/null || die "terraform not found."

if ! aws sts get-caller-identity &>/dev/null; then
  die "AWS credentials not configured. Run 'aws configure' or set AWS environment variables."
fi

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
log "AWS account: ${AWS_ACCOUNT_ID}, region: ${AWS_REGION}"

# ---------------------------------------------------------------------------
# Step 1: Empty S3 bucket before destroy (Terraform force_destroy handles it,
# but pre-emptying avoids version marker issues and speeds up destroy)
# ---------------------------------------------------------------------------
log ""
log "=== Step 1/3: Emptying S3 frontend bucket ==="

NAME_PREFIX="primus-demo-${INSTANCE_NAME}"
S3_BUCKET="${NAME_PREFIX}-frontend-${AWS_ACCOUNT_ID}"

if aws s3api head-bucket --bucket "${S3_BUCKET}" --region "${AWS_REGION}" 2>/dev/null; then
  log "Emptying s3://${S3_BUCKET}..."
  # Delete all objects
  aws s3 rm "s3://${S3_BUCKET}" --recursive --region "${AWS_REGION}" || true
  # Delete all object versions (if versioning was ever enabled)
  aws s3api delete-objects \
    --bucket "${S3_BUCKET}" \
    --region "${AWS_REGION}" \
    --delete "$(aws s3api list-object-versions \
      --bucket "${S3_BUCKET}" \
      --region "${AWS_REGION}" \
      --query '{Objects: Versions[].{Key:Key,VersionId:VersionId}}' \
      --output json 2>/dev/null)" &>/dev/null || true
  success "S3 bucket emptied."
else
  warn "S3 bucket '${S3_BUCKET}' not found — may already be deleted or name differs. Continuing..."
fi

# ---------------------------------------------------------------------------
# Step 2: Terraform destroy
# ---------------------------------------------------------------------------
log ""
log "=== Step 2/3: Running terraform destroy ==="

cd "${TF_DIR}"

# Ensure terraform is initialized
if [[ ! -d .terraform ]]; then
  log "Running terraform init..."
  terraform init -upgrade
fi

terraform destroy \
  -var="instance_name=${INSTANCE_NAME}" \
  -var="aws_region=${AWS_REGION}" \
  -auto-approve

success "terraform destroy complete."

# ---------------------------------------------------------------------------
# Step 3: Belt-and-suspenders ECR cleanup
# (force_delete = true on the repo resource handles this, but confirm)
# ---------------------------------------------------------------------------
log ""
log "=== Step 3/3: Verifying ECR cleanup ==="

for SUFFIX in "backend" "keycloak"; do
  REPO_NAME="${NAME_PREFIX}/${SUFFIX}"
  if aws ecr describe-repositories --repository-names "${REPO_NAME}" --region "${AWS_REGION}" &>/dev/null; then
    warn "ECR repository '${REPO_NAME}' still exists. Deleting..."
    aws ecr delete-repository \
      --repository-name "${REPO_NAME}" \
      --force \
      --region "${AWS_REGION}" || true
    success "ECR repository '${REPO_NAME}' deleted."
  else
    log "  ECR repo '${REPO_NAME}' already deleted — OK"
  fi
done

# ---------------------------------------------------------------------------
# Final confirmation
# ---------------------------------------------------------------------------
echo ""
echo -e "${BOLD}${GREEN}============================================================${NC}"
echo -e "${BOLD}${GREEN}  Primus EHR Demo Teardown Complete${NC}"
echo -e "${BOLD}${GREEN}============================================================${NC}"
echo ""
echo -e "  Instance : ${BOLD}${INSTANCE_NAME}${NC}"
echo -e "  Region   : ${AWS_REGION}"
echo ""
echo "  All AWS resources have been deleted."
echo "  Ongoing cost: \$0"
echo ""
echo "  To redeploy:"
echo -e "    ${BOLD}cd infra && ./deploy.sh ${INSTANCE_NAME}${NC}"
echo ""
echo -e "${BOLD}${GREEN}============================================================${NC}"
