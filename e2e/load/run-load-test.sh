#!/bin/bash
# =============================================================================
# Primus EHR — Load Test Runner
#
# Runs k6 load test simulating 700 concurrent users for 30 minutes.
#
# Prerequisites:
#   brew install k6  (macOS)
#   OR: docker pull grafana/k6
#
# Usage:
#   ./e2e/load/run-load-test.sh                    # Full 30-min test
#   ./e2e/load/run-load-test.sh --quick            # Quick 5-min smoke test
#   ./e2e/load/run-load-test.sh --docker           # Run via Docker
#
# Results: printed to stdout with summary metrics
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TEST_FILE="$SCRIPT_DIR/load-test.js"

BASE_URL="${BASE_URL:-http://localhost:8080}"
AUTH_TOKEN="${AUTH_TOKEN:-mock-jwt-token}"
TENANT_ID="${TENANT_ID:-1}"

echo "=== Primus EHR Load Test ==="
echo "Target: $BASE_URL"
echo "Test file: $TEST_FILE"

# Check if backend is running
if ! curl -sf "$BASE_URL/actuator/health" > /dev/null 2>&1; then
  echo "ERROR: Backend is not running on $BASE_URL"
  exit 1
fi

# Parse arguments
USE_DOCKER=false
QUICK_MODE=false
for arg in "$@"; do
  case $arg in
    --docker) USE_DOCKER=true ;;
    --quick) QUICK_MODE=true ;;
  esac
done

# Set k6 environment variables
export BASE_URL AUTH_TOKEN TENANT_ID

if $QUICK_MODE; then
  echo "Mode: Quick smoke test (5 minutes, 50 VUs)"
  K6_ARGS="--vus 50 --duration 5m"
else
  echo "Mode: Full load test (30 minutes, up to 700 VUs)"
  K6_ARGS=""
fi

echo ""

if $USE_DOCKER; then
  docker run --rm \
    --network host \
    -v "$PROJECT_ROOT:/app:ro" \
    -e BASE_URL="$BASE_URL" \
    -e AUTH_TOKEN="$AUTH_TOKEN" \
    -e TENANT_ID="$TENANT_ID" \
    grafana/k6 run $K6_ARGS /app/e2e/load/load-test.js
else
  k6 run $K6_ARGS "$TEST_FILE"
fi

echo ""
echo "=== Load Test Complete ==="
echo ""
echo "Key thresholds:"
echo "  p95 response time < 500ms"
echo "  p99 response time < 2000ms"
echo "  Error rate < 1%"
echo "  Patient search p95 < 300ms"
