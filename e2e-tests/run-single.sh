#!/bin/bash

# Run a single E2E test case
# Usage: bash run-single.sh <test-case-directory>

set -e

if [ -z "$1" ]; then
  echo "Usage: bash run-single.sh <test-case-directory>"
  echo "Example: bash run-single.sh test-cases/01-basic-operations"
  exit 1
fi

TEST_DIR="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Check if test directory exists
if [ ! -d "$SCRIPT_DIR/$TEST_DIR" ]; then
  echo "Error: Test directory not found: $TEST_DIR"
  exit 1
fi

INPUT_FILE="$SCRIPT_DIR/$TEST_DIR/input.txt"
EXPECTED_FILE="$SCRIPT_DIR/$TEST_DIR/expected-output.txt"
ACTUAL_FILE="$SCRIPT_DIR/$TEST_DIR/actual-output.txt"

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
  echo "Error: Input file not found: $INPUT_FILE"
  exit 1
fi

# Check if expected output file exists
if [ ! -f "$EXPECTED_FILE" ]; then
  echo "Error: Expected output file not found: $EXPECTED_FILE"
  exit 1
fi

echo "Running test: $TEST_DIR"
echo "─────────────────────────────────────"

# Run the application with the input
cd "$PROJECT_ROOT"
node src/infrastructure/cli/main.js < "$INPUT_FILE" > "$ACTUAL_FILE" 2>&1

# Compare outputs
if diff -q "$EXPECTED_FILE" "$ACTUAL_FILE" > /dev/null; then
  echo "✓ Test passed"
  rm "$ACTUAL_FILE"
  exit 0
else
  echo "✗ Test failed"
  echo ""
  echo "Expected output:"
  cat "$EXPECTED_FILE"
  echo ""
  echo "Actual output:"
  cat "$ACTUAL_FILE"
  echo ""
  echo "Diff:"
  diff "$EXPECTED_FILE" "$ACTUAL_FILE" || true
  exit 1
fi

