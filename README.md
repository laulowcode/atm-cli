# ATM Simulation System

A command-line ATM simulation system built with Clean Architecture principles, featuring account management, money transfers, and automatic debt tracking.

## Features

- **Account Management**: Login and logout functionality
- **Financial Operations**: Deposit, withdraw, and transfer money
- **Automatic Debt Tracking**: System automatically creates debts when transferring more than available balance
- **Debt Forgiveness**: When a creditor transfers to a debtor, the debt is reduced first
- **Auto-Pay Debts**: Deposits automatically pay off existing debts before adding to balance
- **Interactive CLI**: Real-time command-line interface for all operations

## Architecture

This project follows **Clean Architecture (Hexagonal Architecture)** principles with clear separation of concerns:

```
src/
├── domain/              # Enterprise Business Rules
│   ├── entities/        # Domain entities (Account, Debt)
│   └── repositories/    # Repository interfaces
├── application/         # Application Business Rules
│   ├── use-cases/       # Use case implementations
│   └── state/           # Application state management
├── interfaces/          # Interface Adapters
│   ├── controllers/     # Input adapters
│   └── presenters/      # Output adapters
└── infrastructure/      # Frameworks & Drivers
    ├── cli/             # CLI entry point
    └── persistence/     # In-memory repository implementations
```

### Architecture Principles

- **Dependency Inversion**: Inner layers don't depend on outer layers
- **Domain Isolation**: Business logic is independent of frameworks
- **Repository Pattern**: Abstract data persistence from business logic
- **Use Case Driven**: Each use case encapsulates a single business operation
- **Test Independence**: Each layer can be tested in isolation

## Installation

### Prerequisites

- Node.js (v18 or higher recommended)
- npm


## Usage

### Interactive Mode

Start the CLI application:

```bash
npm start
```

Or using the shell script:

```bash
bash start.sh
```

### Batch Mode (with input file)

```bash
npm start < input.txt
```

Or:

```bash
bash start.sh < input.txt
```

### Available Commands

- `login <name>` - Login with a user account (creates account if doesn't exist)
- `deposit <amount>` - Deposit money into your account
- `withdraw <amount>` - Withdraw money from your account
- `transfer <name> <amount>` - Transfer money to another user
- `logout` - Logout from current session
- `exit` - Exit the application

### Example Session

```bash
$ login Alice
Hello, Alice!
Your balance is $0

$ deposit 100
Your balance is $100

$ logout
Goodbye, Alice!

$ login Bob
Hello, Bob!
Your balance is $0

$ deposit 80
Your balance is $80

$ transfer Alice 50
Transferred $50 to Alice
Your balance is $30

$ transfer Alice 100
Transferred $30 to Alice
Your balance is $0
Owed $70 to Alice

$ deposit 30
Transferred $30 to Alice
Your balance is $0
Owed $40 to Alice

$ logout
Goodbye, Bob!

$ login Alice
Hello, Alice!
Your balance is $210
Owed $40 from Bob

$ transfer Bob 30
Your balance is $210
Owed $10 from Bob
```

## Testing

### Run All Tests

```bash
npm test
```

Or using the shell script:

```bash
bash test.sh
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory.

### End-to-End Tests

Run all E2E tests:

```bash
bash e2e-tests/run-all.sh
```

Run a single E2E test:

```bash
bash e2e-tests/run-single.sh test-cases/1
```

See `e2e-tests/README.md` for more details.

## Key Business Rules

### Money Transfer Logic

1. **Normal Transfer**: If sender has sufficient balance, transfer full amount
2. **Insufficient Balance**: Transfer available cash and create debt for remainder
3. **Debt Forgiveness**: If receiver owes sender, reduce debt first before transferring cash

### Deposit Logic

1. **Auto-Pay Debts**: Automatically pays off debts in order before adding to balance
2. **Priority Payment**: Pays oldest debts first
3. **Remaining Balance**: Any amount left after debt payment is added to account

### Debt Management

- Debts are automatically created when transferring more than available balance
- Debts are automatically reduced when creditor transfers to debtor (debt forgiveness)
- Debts are automatically paid when depositing money
- Multiple debts to different creditors are supported

## Project Structure

```
dkatalis-atm/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Account.js           # Account entity
│   │   │   └── Debt.js              # Debt entity
│   │   └── repositories/
│   │       ├── AccountRepository.js # Account repository interface
│   │       └── DebtRepository.js    # Debt repository interface
│   ├── application/
│   │   ├── state/
│   │   │   └── SessionManager.js    # Session state management
│   │   └── use-cases/
│   │       ├── LoginUser.js         # Login use case
│   │       ├── LogoutUser.js        # Logout use case
│   │       ├── DepositMoney.js      # Deposit use case
│   │       ├── WithdrawMoney.js     # Withdraw use case
│   │       └── TransferMoney.js     # Transfer use case
│   ├── interfaces/
│   │   ├── controllers/
│   │   │   └── CliController.js     # CLI command controller
│   │   └── presenters/
│   │       └── CliPresenter.js      # CLI output presenter
│   ├── infrastructure/
│   │   ├── cli/
│   │   │   └── main.js              # Application entry point
│   │   └── persistence/
│   │       ├── InMemoryAccountRepository.js
│   │       └── InMemoryDebtRepository.js
│   └── __tests__/                    # Unit test files (mirrors src structure)
│       ├── domain/
│       ├── application/
│       ├── interfaces/
│       └── infrastructure/
├── e2e-tests/                        # End-to-end tests
│   ├── test-cases/                   # E2E test cases
│   ├── run-all.sh                    # Run all E2E tests
│   └── run-single.sh                 # Run single E2E test
├── input.txt                         # Sample input file
├── package.json
├── jest.config.js
├── start.sh                          # Start script
└── test.sh                           # Test script
```

## Development

### Adding New Features

1. **Define Entity** (if needed): Add domain entities in `src/domain/entities/`
2. **Create Use Case**: Implement business logic in `src/application/use-cases/`
3. **Update Controller**: Add command handling in `src/interfaces/controllers/`
4. **Update Presenter**: Add output formatting in `src/interfaces/presenters/`
5. **Write Tests**: Add comprehensive tests in `src/__tests__/`

### Testing Strategy

- **Domain Layer**: Test pure business logic without mocks
- **Application Layer**: Test use cases with mocked repositories
- **Interface Layer**: Test presenters and controllers with mocked use cases
- **Infrastructure Layer**: Test repository implementations

### Code Quality

- Follow Clean Architecture principles
- Maintain separation of concerns
- Write comprehensive tests (aim for 100% coverage)
- Use dependency injection
- Keep use cases focused and single-purpose

## Technical Details

### Dependencies

- **Runtime**: Node.js with ES Modules
- **Testing**: Jest (with experimental VM modules support)

### Design Patterns

- **Repository Pattern**: Abstracts data persistence
- **Dependency Injection**: Constructor-based injection
- **Command Pattern**: CLI commands
- **Presenter Pattern**: Output formatting
- **Use Case Pattern**: Business logic encapsulation

### Data Flow

```
User Input → CliController → Use Case → Repository → Entity
                ↓                           ↓
            Presenter ← DTO ← Use Case ← Repository
                ↓
          CLI Output
```

## License

ISC

## Author

Tran Phuc Thanh (James)
