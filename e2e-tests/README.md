# End-to-End Tests

This folder has E2E tests for the ATM CLI.

## Test Cases

1. **Complete Scenario** - Tests deposit, transfer, debt creation, auto-pay debts, and debt forgiveness
2. **Login While Logged In** - Tests that login is prevented when another user is already logged in
3. **Chaining Payment** - Tests automatic chaining payment when a creditor also has debts
   - Alice owes Bob $30, Bob owes Charlie $30
   - Alice deposits $40 → pays Bob $30 → Bob automatically pays Charlie $30 (chain payment)
   - Final state: Alice balance $10, Bob balance $0, Charlie balance $30
4. **Circular Debt with Chaining Payment** - Tests chaining payment in a circular debt scenario
   - Alice owes Bob $30, Bob owes Charlie $30, Charlie owes Alice $30 (circular debt)
   - Alice deposits $10 → triggers chain payment: Alice → Bob → Charlie → Alice
   - Circular debt protection prevents infinite loops
   - Final state: Each person's debt reduced by $10 (from $30 to $20)

## Structure

- `run-all.sh`: Runs all tests
- `run-single.sh`: Runs a single test
- `test-cases/`: Each subfolder is a test case

## How to Run

- Run all tests:
  ```bash
  bash e2e-tests/run-all.sh
  ```
- Run one test:
  ```bash
  bash e2e-tests/run-single.sh test-cases/01
  ```
