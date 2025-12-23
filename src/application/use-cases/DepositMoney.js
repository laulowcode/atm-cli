import { OldestDebtFirstStrategy } from '../strategies/debt-payment/OldestDebtFirstStrategy.js';

export class DepositMoney {
  /**
   * @constructor
   * Create a new deposit money use case
   * @param {import('../../domain/repositories/AccountRepository.js').AccountRepository} accountRepository - The account repository
   * @param {import('../../domain/repositories/DebtRepository.js').DebtRepository} debtRepository - The debt repository
   */
  constructor(accountRepository, debtRepository, debtPaymentStrategy = new OldestDebtFirstStrategy()) {
    this.accountRepository = accountRepository;
    this.debtRepository = debtRepository;
    this.debtPaymentStrategy = debtPaymentStrategy;
  }

  execute(name, amount) {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    const transferLogs = [];
    const visited = new Set(); // Track processed users to avoid infinite loops
    
    const remainingAmount = this._executeWithChaining(name, amount, transferLogs, visited);
    
    const account = this.accountRepository.findByName(name);
    if (!account) {
      throw new Error('Account not found');
    }
    
    if (remainingAmount > 0) {
      account.deposit(remainingAmount);
      this.accountRepository.save(account);
    }
    
    return {
      balance: account.balance,
      logs: transferLogs,
      remainingDebts: this.debtRepository.findDebtsByDebtor(name)
    };
  }

  /**
   * Execute deposit with chaining payment support
   * @param {string} name - Account name
   * @param {number} amount - Amount to deposit
   * @param {Array<string>} transferLogs - Array to collect transfer logs
   * @param {Set<string>} visited - Set to track visited users (avoid infinite loops)
   * @returns {number} Remaining amount after paying debts (this amount should be deposited to the account's balance)
   */
  _executeWithChaining(name, amount, transferLogs, visited) {
    // Avoid infinite loops (circular debt protection)
    if (visited.has(name)) {
      return 0;
    }
    visited.add(name);

    const account = this.accountRepository.findByName(name);
    if (!account) {
      throw new Error('Account not found');
    }

    let remainingAmount = amount;

    // Begin to pay off debts
    const debts = this.debtPaymentStrategy.sort(this.debtRepository.findDebtsByDebtor(name));

    for (const debt of debts) {
      if (remainingAmount <= 0) {
        break;
      }
  
      const creditorAccount = this.accountRepository.findByName(debt.creditorName);
      if (!creditorAccount) {
        continue;
      }

      // Calculate the amount to pay off the debt
      const paymentAmount = Math.min(remainingAmount, debt.amount);

      // Update the debt (remove it from debtor's debt list)
      const isFullyPaid = debt.makePayment(paymentAmount);
      if (isFullyPaid) {
        this.debtRepository.remove(debt);
      } else {
        this.debtRepository.save(debt);
      }

      // Update the remaining amount for the debtor
      remainingAmount -= paymentAmount;

      transferLogs.push(`Transferred $${paymentAmount} to ${creditorAccount.name}`);

      // Chain payment - creditor receives money and pays their debts
      // Recursively process creditor's debts first
      const creditorRemainingAfterDebts = this._executeWithChaining(
        debt.creditorName,
        paymentAmount,
        transferLogs,
        visited
      );
      
      // Deposit the remaining amount to creditor's balance
      if (creditorRemainingAfterDebts > 0) {
        creditorAccount.deposit(creditorRemainingAfterDebts);
        this.accountRepository.save(creditorAccount);
      }
    }

    return remainingAmount;
  }
}
