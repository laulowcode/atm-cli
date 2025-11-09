import readline from 'readline';

// Infrastructure (Persistence)
import { InMemoryAccountRepository } from '../persistence/InMemoryAccountRepository.js';
import { InMemoryDebtRepository } from '../persistence/InMemoryDebtRepository.js';

// Application (Use Cases)
import { LoginUser } from '../../application/use-cases/LoginUser.js';
import { DepositMoney } from '../../application/use-cases/DepositMoney.js';
import { WithdrawMoney } from '../../application/use-cases/WithdrawMoney.js';
import { TransferMoney } from '../../application/use-cases/TransferMoney.js';
import { LogoutUser } from '../../application/use-cases/LogoutUser.js';

// Interface (Adapters)
import { CliController } from '../../interfaces/controllers/CliController.js';
import { CliPresenter } from '../../interfaces/presenters/CliPresenter.js';

// Application (State)
import { SessionManager } from '../../application/state/SessionManager.js';

const accountRepository = new InMemoryAccountRepository();
const debtRepository = new InMemoryDebtRepository();

const session = new SessionManager();

const useCases = {
  loginUser: new LoginUser(accountRepository, debtRepository),
  depositMoney: new DepositMoney(accountRepository, debtRepository),
  withdrawMoney: new WithdrawMoney(accountRepository, debtRepository),
  transferMoney: new TransferMoney(accountRepository, debtRepository),
  logoutUser: new LogoutUser(session)
};

const presenter = new CliPresenter();

const controller = new CliController(presenter, session, useCases);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '$ '
});

rl.prompt();

rl.on('line', (line) => {
  const trimmedLine = line.trim();
  if (trimmedLine.toLowerCase() === 'exit') {
    rl.close();
    return
  }
  const output = controller.handleCommand(trimmedLine);
  if (output) {
    console.log(output);
  }
  rl.prompt();
}).on('close', () => {
  console.log('Goodbye!');
  process.exit(0);
});