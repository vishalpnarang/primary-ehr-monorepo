#!/bin/bash
# =============================================================================
# Primus EHR — Automated Security Scan (OWASP ZAP)
#
# Scans the running API for OWASP Top 10 vulnerabilities.
#
# Prerequisites:
#   1. Docker installed
#   2. Backend + Keycloak + PostgreSQL running (docker compose up)
#   3. Run from project root: ./e2e/security/run-security-scan.sh
#
# Output: e2e/security/reports/zap-report.html
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPORT_DIR="$SCRIPT_DIR/reports"

echo "=== Primus EHR Security Scan ==="
echo "Project root: $PROJECT_ROOT"

# Create report directory
mkdir -p "$REPORT_DIR"

# Check if backend is running
if ! curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1; then
  echo "ERROR: Backend is not running on localhost:8080"
  echo "Start it with: docker compose up -d && cd backend && ./mvnw spring-boot:run"
  exit 1
fi

echo "Backend is healthy. Starting OWASP ZAP scan..."

# Run OWASP ZAP in Docker
# -v mounts the project directory so ZAP can read the config and write reports
docker run --rm \
  --network host \
  -v "$PROJECT_ROOT:/zap/wrk:rw" \
  -t owasp/zap2docker-stable \
  zap.sh -cmd -autorun /zap/wrk/e2e/security/zap-config.yaml

echo ""
echo "=== Scan Complete ==="
echo "Report: $REPORT_DIR/zap-report.html"
echo ""

# Check for high-severity findings
if grep -q '"High"' "$REPORT_DIR/zap-report.html" 2>/dev/null; then
  echo "WARNING: High-severity vulnerabilities found!"
  echo "Review the report before deploying to production."
  exit 1
else
  echo "No high-severity vulnerabilities found."
fi
