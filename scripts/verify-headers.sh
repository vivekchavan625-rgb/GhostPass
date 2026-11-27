#!/usr/bin/env bash
# GhostPass Post-Deployment Header Verification Script
# Usage: ./scripts/verify-headers.sh <url>

set -euo pipefail

TARGET_URL="${1:-}"

if [[ -z "$TARGET_URL" ]]; then
  echo "Usage: $0 <url>"
  echo "Example: $0 https://ghostpass.vercel.app"
  exit 1
fi

echo "=========================================================="
echo " GhostPass Header Verification: $TARGET_URL"
echo "=========================================================="

HEADERS=$(curl -sI -L "$TARGET_URL")

check_header() {
  local header_name="$1"
  local expected_substring="$2"
  
  if echo "$HEADERS" | grep -iq "^${header_name}:.*${expected_substring}"; then
    echo "  [PASS] $header_name contains '$expected_substring'"
  else
    echo "  [FAIL] $header_name missing or does not match '$expected_substring'"
    return 1
  fi
}

FAILED=0

echo "Auditing Security Headers..."
check_header "content-security-policy" "connect-src 'none'" || FAILED=1
check_header "content-security-policy" "default-src 'self'" || FAILED=1
check_header "x-content-type-options" "nosniff" || FAILED=1
check_header "referrer-policy" "no-referrer" || FAILED=1
check_header "permissions-policy" "camera=()" || FAILED=1
check_header "cross-origin-opener-policy" "same-origin" || FAILED=1

echo "----------------------------------------------------------"
if [[ $FAILED -eq 0 ]]; then
  echo "RESULT: ALL SECURITY HEADERS VERIFIED SUCCESSFULLY"
  exit 0
else
  echo "RESULT: SECURITY HEADER AUDIT FAILED"
  exit 1
fi
