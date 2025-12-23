// infrastructure/api/server.js
import express from 'express';

// Infrastructure (Persistence)
import { InMemoryAccountRepository } from '../persistence/InMemoryAccountRepository.js';
import { InMemoryDebtRepository } from '../persistence/InMemoryDebtRepository.js';

// Application (State)
import { SessionManager } from '../../application/state/SessionManager.js';

// Application (Use Cases)
import { LoginUser } from '../../application/use-cases/LoginUser.js';
import { DepositMoney } from '../../application/use-cases/DepositMoney.js';
import { TransferMoney } from '../../application/use-cases/TransferMoney.js';
import { LogoutUser } from '../../application/use-cases/LogoutUser.js';
import { WithdrawMoney } from '../../application/use-cases/WithdrawMoney.js';

// Interface (Adapters)
import { RESTController } from '../../interfaces/controllers/RESTController.js';
import { RESTPresenter } from '../../interfaces/presenters/RESTPresenter.js';

const app = express();
app.use(express.json());

// Repositories
const accountRepository = new InMemoryAccountRepository();
const debtRepository = new InMemoryDebtRepository();
const sessionManager = new SessionManager();

// Use Cases
const useCases = {
  loginUser: new LoginUser(accountRepository, debtRepository),
  depositMoney: new DepositMoney(accountRepository, debtRepository),
  withdrawMoney: new WithdrawMoney(accountRepository),
  transferMoney: new TransferMoney(accountRepository, debtRepository),
  logoutUser: new LogoutUser(sessionManager)
};

const presenter = new RESTPresenter();

const controller = new RESTController(presenter, sessionManager, useCases);

// Routes
app.post('/api/deposit', (req, res) => controller.deposit(req, res));
app.post('/api/withdraw', (req, res) => controller.withdraw(req, res));
app.post('/api/transfer', (req, res) => controller.transfer(req, res));
app.post('/api/logout', (req, res) => controller.logout(req, res));
app.post('/api/login', (req, res) => controller.login(req, res));

app.listen(3000, () => console.log('API running on port 3000'));