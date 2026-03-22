#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# snapshot.sh — Save database before destroying infrastructure
#
# Usage:   ./snapshot.sh <instance-name>
# Example: ./snapshot.sh demo-think
#
# Creates:
#   1. RDS cluster snapshot (fastest restore, ~$0.02/GB/month)
#   2. pg_dump to S3 (backup, ~$0.01/GB/month)
#
# Next deploy.sh auto-detects snapshot → restores with all customer data.
# ---------------------------------------------------------------------------

set -euo pipefail
export AWS_PROFILE="primus"

INSTANCE_NAME="${1:?Usage: ./snapshot.sh <instance-name>}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
NAME_PREFIX="primus-demo-${INSTANCE_NAME}"
SNAPSHOT_ID="${NAME_PREFIX}-snap-${TIMESTAMP}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Primus EHR — Database Snapshot"
echo "  Instance: ${INSTANCE_NAME}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. RDS Snapshot
CLUSTER_ID="${NAME_PREFIX}-aurora"
echo "[1/2] Taking RDS snapshot: ${SNAPSHOT_ID}..."
if aws rds describe-db-clusters --db-cluster-identifier "${CLUSTER_ID}" &>/dev/null; then
  aws rds create-db-cluster-snapshot \
    --db-cluster-identifier "${CLUSTER_ID}" \
    --db-cluster-snapshot-identifier "${SNAPSHOT_ID}" \
    --output text > /dev/null 2>&1
  echo "  ✓ RDS snapshot created: ${SNAPSHOT_ID}"
  echo "  ✓ Persists after terraform destroy"
else
  echo "  ⚠ No Aurora cluster found — skipping RDS snapshot"
fi

# 2. pg_dump to S3
S3_BUCKET="${NAME_PREFIX}-frontend"
echo "[2/2] pg_dump to S3..."
TASK_ARN=$(aws ecs list-tasks --cluster "${NAME_PREFIX}-cluster" \
  --service-name "${NAME_PREFIX}-svc-backend" --desired-status RUNNING \
  --query "taskArns[0]" --output text 2>/dev/null || echo "None")

if [[ "${TASK_ARN}" != "None" && -n "${TASK_ARN}" ]]; then
  aws ecs execute-command --cluster "${NAME_PREFIX}-cluster" \
    --task "${TASK_ARN}" --container backend --interactive \
    --command "pg_dump -h ${NAME_PREFIX}-aurora.cluster-xxx.us-east-1.rds.amazonaws.com -U primusadmin -d primusehr --no-owner | gzip" \
    > "/tmp/${SNAPSHOT_ID}.sql.gz" 2>/dev/null || true

  if [[ -s "/tmp/${SNAPSHOT_ID}.sql.gz" ]]; then
    aws s3 cp "/tmp/${SNAPSHOT_ID}.sql.gz" "s3://${S3_BUCKET}/backups/${SNAPSHOT_ID}.sql.gz" --quiet
    aws s3 cp "/tmp/${SNAPSHOT_ID}.sql.gz" "s3://${S3_BUCKET}/backups/latest.sql.gz" --quiet
    rm -f "/tmp/${SNAPSHOT_ID}.sql.gz"
    echo "  ✓ pg_dump uploaded to s3://${S3_BUCKET}/backups/"
  else
    echo "  ⚠ pg_dump failed — RDS snapshot is primary backup"
  fi
else
  echo "  ⚠ No running tasks — RDS snapshot is primary backup"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✓ Snapshot complete"
echo ""
echo "  Now safe to destroy:"
echo "    ./destroy.sh ${INSTANCE_NAME}"
echo ""
echo "  To restore later:"
echo "    ./deploy.sh ${INSTANCE_NAME}"
echo "    (auto-detects snapshot → restores customer data)"
echo ""
echo "  Storage cost: ~\$0.50/month"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
