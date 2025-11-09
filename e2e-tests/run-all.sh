#!/bin/bash

# Run all E2E test cases

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_CASES_DIR="$SCRIPT_DIR/test-cases"

echo "═══════════════════════════════════════"
echo "  Running All E2E Tests"
echo "═══════════════════════════════════════"
echo ""

PASSED=0
FAILED=0
FAILED_TESTS=()

# Find all test case directories
for test_dir in "$TEST_CASES_DIR"/*; do
  if [ -d "$test_dir" ]; then
    test_name=$(basename "$test_dir")
    
    if bash "$SCRIPT_DIR/run-single.sh" "test-cases/$test_name"; then
      ((PASSED++))
    else
      ((FAILED++))
      FAILED_TESTS+=("$test_name")
    fi
    echo ""
  fi
done

echo "═══════════════════════════════════════"
echo "  Test Results"
echo "═══════════════════════════════════════"
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo ""

if [ $FAILED -gt 0 ]; then
  echo "Failed tests:"
  for test in "${FAILED_TESTS[@]}"; do
    echo "  - $test"
  done
  echo ""
  exit 1
else
  echo "All tests passed!"
  exit 0
fi

