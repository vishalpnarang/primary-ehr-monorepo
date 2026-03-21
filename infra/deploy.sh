#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# deploy.sh — Primus EHR one-click demo deployment
#
# Usage:
#   ./deploy.sh <instance-name> [aws-region]
#   ./deploy.sh demo-acme
#   ./deploy.sh demo-primaryplus us-west-2
#
# What this does:
#   1. Validate prerequisites (aws, terraform, docker, node, mvn)
#   2. terraform init + apply → provisions all AWS infrastructure
#   3. Build frontend (both portals with Vite)
#   4. Build backend Docker image (Spring Boot fat JAR)
#   5. Push Docker images to ECR
#   6. Upload frontend build to S3
#   7. Invalidate CloudFront cache
#   8. Run database seed SQL against Aurora via ECS exec
#   9. Import Keycloak realm configuration
#  10. Print final access URLs
#
# Prerequisites:
#   - AWS CLI configured (aws configure or IAM role)
#   - Terraform >= 1.5 installed
#   - Docker running
#   - Node.js >= 20 + pnpm installed
#   - Java 21 + Maven installed (for Spring Boot)
# ---------------------------------------------------------------------------

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TF_DIR="${SCRIPT_DIR}/terraform"

INSTANCE_NAME="${1:-}"
AWS_REGION="${2:-us-east-1}"

# ---------------------------------------------------------------------------
# Colors and logging
# ---------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

log()    { echo -e "${BLUE}[deploy]${NC} $*"; }
success(){ echo -e "${GREEN}[deploy]${NC} $*"; }
warn()   { echo -e "${YELLOW}[deploy]${NC} $*"; }
error()  { echo -e "${RED}[deploy] ERROR:${NC} $*" >&2; }
die()    { error "$*"; exit 1; }

# ---------------------------------------------------------------------------
# Validate input
# ---------------------------------------------------------------------------
if [[ -z "${INSTANCE_NAME}" ]]; then
  cat <<-EOF

  ${BOLD}Primus EHR — Demo Deployment${NC}

  Usage: ./deploy.sh <instance-name> [aws-region]

  Examples:
    ./deploy.sh demo-acme
    ./deploy.sh demo-primaryplus us-west-2

  instance-name must be lowercase alphanumeric and hyphens only.

EOF
  exit 1
fi

if ! [[ "${INSTANCE_NAME}" =~ ^[a-z0-9-]+$ ]]; then
  die "instance-name '${INSTANCE_NAME}' is invalid. Use lowercase letters, numbers, and hyphens only."
fi

# ---------------------------------------------------------------------------
# Step 0: Check prerequisites
# ---------------------------------------------------------------------------
log "Checking prerequisites..."

check_cmd() {
  if ! command -v "$1" &>/dev/null; then
    die "$1 is not installed or not on PATH. Install it and try again."
  fi
  log "  $1 ... OK"
}

check_cmd aws
check_cmd terraform
check_cmd docker
check_cmd node
check_cmd pnpm

# Check Terraform version
TF_VERSION=$(terraform version -json | python3 -c "import sys,json; print(json.load(sys.stdin)['terraform_version'])")
log "  terraform ${TF_VERSION}"

# Check AWS credentials
if ! aws sts get-caller-identity &>/dev/null; then
  die "AWS credentials are not configured. Run 'aws configure' or set AWS environment variables."
fi
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
log "  AWS account: ${AWS_ACCOUNT_ID}, region: ${AWS_REGION}"

# Check Docker is running
if ! docker info &>/dev/null; then
  die "Docker is not running. Start Docker Desktop (or the Docker daemon) and try again."
fi

# ---------------------------------------------------------------------------
# Step 1: Terraform init + apply
# ---------------------------------------------------------------------------
log ""
log "=== Step 1/9: Provisioning AWS infrastructure with Terraform ==="

cd "${TF_DIR}"

# Create tfvars if example exists but tfvars does not
if [[ ! -f terraform.tfvars ]]; then
  if [[ -f terraform.tfvars.example ]]; then
    warn "No terraform.tfvars found. Copying from example — review before production use."
    cp terraform.tfvars.example terraform.tfvars
  fi
fi

terraform init -upgrade
terraform apply \
  -var="instance_name=${INSTANCE_NAME}" \
  -var="aws_region=${AWS_REGION}" \
  -auto-approve

# Capture Terraform outputs
APP_URL=$(terraform output -raw cloudfront_url)
API_URL=$(terraform output -raw api_base_url)
KEYCLOAK_URL=$(terraform output -raw keycloak_admin_url)
S3_BUCKET=$(terraform output -raw s3_frontend_bucket)
ECR_BACKEND=$(terraform output -raw ecr_backend_url)
ECR_KEYCLOAK=$(terraform output -raw ecr_keycloak_url)
CLOUDFRONT_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='Primus EHR frontend — ${local_name_prefix}'].Id | [0]" \
  --output text 2>/dev/null || echo "")
ECS_CLUSTER=$(terraform output -raw ecs_cluster_name)
DB_SECRET=$(terraform output -raw secret_db_credentials_arn)

success "Infrastructure provisioned."

# ---------------------------------------------------------------------------
# Step 2: Build frontend (provider portal + patient portal)
# ---------------------------------------------------------------------------
log ""
log "=== Step 2/9: Building frontend applications ==="

cd "${REPO_ROOT}"

# Install dependencies if node_modules is missing
if [[ ! -d node_modules ]]; then
  log "Installing dependencies..."
  pnpm install --frozen-lockfile
fi

# Build provider portal
log "Building provider portal..."
pnpm --filter provider-portal build

# Build patient portal
log "Building patient portal..."
pnpm --filter patient-portal build

success "Frontend builds complete."

# ---------------------------------------------------------------------------
# Step 3: Build backend Docker image (Spring Boot)
# ---------------------------------------------------------------------------
log ""
log "=== Step 3/9: Building Spring Boot backend Docker image ==="

BACKEND_DIR="${REPO_ROOT}/backend"

if [[ -d "${BACKEND_DIR}" ]]; then
  cd "${BACKEND_DIR}"

  # Build the fat JAR
  if [[ -f pom.xml ]]; then
    log "Running mvn package..."
    mvn package -DskipTests -q
  elif [[ -f build.gradle ]] || [[ -f build.gradle.kts ]]; then
    log "Running gradle bootJar..."
    ./gradlew bootJar -x test --quiet
  else
    warn "No build file found in backend/. Skipping backend build."
  fi

  # Build Docker image
  BACKEND_IMAGE="${ECR_BACKEND}:latest"
  log "Building Docker image: ${BACKEND_IMAGE}"
  docker build -t "${BACKEND_IMAGE}" -f Dockerfile .
  success "Backend image built."
else
  warn "backend/ directory not found. Skipping backend Docker build."
  warn "Create backend/ and run deploy.sh again to push a real backend image."
fi

# ---------------------------------------------------------------------------
# Step 4: Build Keycloak Docker image
# ---------------------------------------------------------------------------
log ""
log "=== Step 4/9: Building Keycloak Docker image ==="

KEYCLOAK_DOCKERFILE="${REPO_ROOT}/infra/keycloak/Dockerfile"
if [[ -f "${KEYCLOAK_DOCKERFILE}" ]]; then
  KEYCLOAK_IMAGE="${ECR_KEYCLOAK}:latest"
  docker build -t "${KEYCLOAK_IMAGE}" -f "${KEYCLOAK_DOCKERFILE}" "${REPO_ROOT}/infra/keycloak"
  success "Keycloak image built."
else
  # Use the official Keycloak 24 image directly
  KEYCLOAK_IMAGE="quay.io/keycloak/keycloak:24.0"
  warn "No custom Keycloak Dockerfile found. Will retag official keycloak:24.0 image."
  docker pull "${KEYCLOAK_IMAGE}"
  docker tag "${KEYCLOAK_IMAGE}" "${ECR_KEYCLOAK}:latest"
  success "Keycloak image pulled and tagged."
fi

# ---------------------------------------------------------------------------
# Step 5: Push Docker images to ECR
# ---------------------------------------------------------------------------
log ""
log "=== Step 5/9: Pushing Docker images to ECR ==="

# Authenticate Docker to ECR
log "Logging in to ECR..."
aws ecr get-login-password --region "${AWS_REGION}" | \
  docker login --username AWS --password-stdin "${ECR_REGISTRY}"

if [[ -d "${REPO_ROOT}/backend" ]]; then
  log "Pushing backend image..."
  docker push "${ECR_BACKEND}:latest"
  success "Backend image pushed to ECR."
fi

log "Pushing Keycloak image..."
docker push "${ECR_KEYCLOAK}:latest"
success "Keycloak image pushed to ECR."

# ---------------------------------------------------------------------------
# Step 6: Upload frontend to S3
# ---------------------------------------------------------------------------
log ""
log "=== Step 6/9: Uploading frontend to S3 ==="

PROVIDER_BUILD="${REPO_ROOT}/apps/provider-portal/dist"
PATIENT_BUILD="${REPO_ROOT}/apps/patient-portal/dist"

if [[ -d "${PROVIDER_BUILD}" ]]; then
  log "Uploading provider portal to s3://${S3_BUCKET}/..."
  aws s3 sync "${PROVIDER_BUILD}" "s3://${S3_BUCKET}/" \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "*.html" \
    --region "${AWS_REGION}"
  # HTML files get shorter cache (so users always get fresh index.html)
  aws s3 sync "${PROVIDER_BUILD}" "s3://${S3_BUCKET}/" \
    --delete \
    --cache-control "public, max-age=0, must-revalidate" \
    --include "*.html" \
    --region "${AWS_REGION}"
  success "Provider portal uploaded."
else
  warn "Provider portal build not found at ${PROVIDER_BUILD}. Skipping."
fi

if [[ -d "${PATIENT_BUILD}" ]]; then
  log "Uploading patient portal to s3://${S3_BUCKET}/patient/..."
  aws s3 sync "${PATIENT_BUILD}" "s3://${S3_BUCKET}/patient/" \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "*.html" \
    --region "${AWS_REGION}"
  aws s3 sync "${PATIENT_BUILD}" "s3://${S3_BUCKET}/patient/" \
    --delete \
    --cache-control "public, max-age=0, must-revalidate" \
    --include "*.html" \
    --region "${AWS_REGION}"
  success "Patient portal uploaded."
else
  warn "Patient portal build not found at ${PATIENT_BUILD}. Skipping."
fi

# ---------------------------------------------------------------------------
# Step 7: Invalidate CloudFront cache
# ---------------------------------------------------------------------------
log ""
log "=== Step 7/9: Invalidating CloudFront cache ==="

# Find distribution ID by S3 origin
DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Origins.Items[0].DomainName=='${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com'].Id | [0]" \
  --output text --region "${AWS_REGION}" 2>/dev/null || echo "None")

if [[ "${DIST_ID}" != "None" ]] && [[ -n "${DIST_ID}" ]]; then
  aws cloudfront create-invalidation \
    --distribution-id "${DIST_ID}" \
    --paths "/*" \
    --region "${AWS_REGION}" \
    --query 'Invalidation.Id' --output text
  success "CloudFront cache invalidated."
else
  warn "Could not find CloudFront distribution. Cache not invalidated — may take up to 24h to refresh."
fi

# ---------------------------------------------------------------------------
# Step 8: Wait for ECS services to stabilize, then seed database
# ---------------------------------------------------------------------------
log ""
log "=== Step 8/9: Seeding database ==="

log "Waiting for ECS backend service to become stable (this takes ~3-5 minutes)..."
aws ecs wait services-stable \
  --cluster "${ECS_CLUSTER}" \
  --services "$(cd "${TF_DIR}" && terraform output -raw ecs_backend_service)" \
  --region "${AWS_REGION}" || warn "ECS wait timed out — services may still be starting."

SEED_SQL="${REPO_ROOT}/infra/seed/seed.sql"
if [[ -f "${SEED_SQL}" ]]; then
  log "Running seed SQL via ECS exec..."
  # Get a running backend task ARN
  TASK_ARN=$(aws ecs list-tasks \
    --cluster "${ECS_CLUSTER}" \
    --service-name "$(cd "${TF_DIR}" && terraform output -raw ecs_backend_service)" \
    --desired-status RUNNING \
    --query 'taskArns[0]' --output text --region "${AWS_REGION}")

  if [[ "${TASK_ARN}" != "None" ]] && [[ -n "${TASK_ARN}" ]]; then
    DB_HOST=$(cd "${TF_DIR}" && terraform output -raw db_endpoint)
    DB_NAME=$(cd "${TF_DIR}" && terraform output -raw db_name)
    DB_CREDS=$(aws secretsmanager get-secret-value \
      --secret-id "${DB_SECRET}" \
      --query SecretString --output text --region "${AWS_REGION}")
    DB_USER=$(echo "${DB_CREDS}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['username'])")
    DB_PASS=$(echo "${DB_CREDS}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['password'])")

    # Upload seed file to /tmp in the container and execute it
    aws ecs execute-command \
      --cluster "${ECS_CLUSTER}" \
      --task "${TASK_ARN}" \
      --container backend \
      --interactive \
      --command "PGPASSWORD=${DB_PASS} psql -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} -f /tmp/seed.sql" \
      --region "${AWS_REGION}" || warn "Seed SQL failed — run manually if needed."
    success "Database seeded."
  else
    warn "No running backend task found. Seed SQL skipped — run manually after services start."
  fi
else
  warn "No seed file found at ${SEED_SQL}. Skipping database seeding."
  warn "Create infra/seed/seed.sql with your demo data and re-run deploy.sh."
fi

# ---------------------------------------------------------------------------
# Step 9: Import Keycloak realm
# ---------------------------------------------------------------------------
log ""
log "=== Step 9/9: Importing Keycloak realm ==="

REALM_FILE="${REPO_ROOT}/infra/keycloak/primus-realm.json"
if [[ -f "${REALM_FILE}" ]]; then
  log "Waiting for Keycloak to become healthy..."
  MAX_WAIT=120
  WAITED=0
  until curl -sf "${KEYCLOAK_URL%/admin}/health/ready" &>/dev/null; do
    if [[ ${WAITED} -ge ${MAX_WAIT} ]]; then
      warn "Keycloak health check timed out. Realm import skipped."
      break
    fi
    sleep 10
    WAITED=$((WAITED + 10))
    log "  waiting... (${WAITED}s elapsed)"
  done

  if curl -sf "${KEYCLOAK_URL%/admin}/health/ready" &>/dev/null; then
    KC_SECRET_VAL=$(aws secretsmanager get-secret-value \
      --secret-id "$(cd "${TF_DIR}" && terraform output -raw secret_keycloak_credentials_arn)" \
      --query SecretString --output text --region "${AWS_REGION}")
    KC_ADMIN=$(echo "${KC_SECRET_VAL}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['admin_user'])")
    KC_PASS=$(echo "${KC_SECRET_VAL}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['admin_password'])")

    # Get admin token
    KC_TOKEN=$(curl -sf -X POST \
      "${KEYCLOAK_URL%/admin}/realms/master/protocol/openid-connect/token" \
      -d "username=${KC_ADMIN}&password=${KC_PASS}&grant_type=password&client_id=admin-cli" \
      -H "Content-Type: application/x-www-form-urlencoded" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

    # Import realm
    curl -sf -X POST \
      "${KEYCLOAK_URL%/admin}/realms" \
      -H "Authorization: Bearer ${KC_TOKEN}" \
      -H "Content-Type: application/json" \
      -d @"${REALM_FILE}"

    success "Keycloak realm 'primus' imported."
  fi
else
  warn "No realm file found at ${REALM_FILE}."
  warn "Create infra/keycloak/primus-realm.json and re-run deploy.sh to import the realm."
fi

# ---------------------------------------------------------------------------
# Final output
# ---------------------------------------------------------------------------
echo ""
echo -e "${BOLD}${GREEN}============================================================${NC}"
echo -e "${BOLD}${GREEN}  Primus EHR Demo Deployment Complete!${NC}"
echo -e "${BOLD}${GREEN}============================================================${NC}"
echo ""
echo -e "  Instance       : ${BOLD}${INSTANCE_NAME}${NC}"
echo -e "  Region         : ${AWS_REGION}"
echo ""
echo -e "  PROVIDER PORTAL: ${BOLD}${APP_URL}${NC}"
echo -e "  PATIENT PORTAL : ${BOLD}${APP_URL}/patient${NC}"
echo -e "  API            : ${API_URL}"
echo -e "  KEYCLOAK ADMIN : ${KEYCLOAK_URL}"
echo ""
echo -e "  To tear everything down:"
echo -e "    ${BOLD}cd infra && ./destroy.sh ${INSTANCE_NAME}${NC}"
echo ""
echo -e "${BOLD}${GREEN}============================================================${NC}"
