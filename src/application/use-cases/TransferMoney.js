import { Debt } from '../../domain/entities/Debt.js';

export class TransferMoney {
  /**
   * @constructor
   * Create a new transfer money use case
   * @param {import('../../domain/repositories/AccountRepository.js').AccountRepository} accountRepository - The account repository
   * @param {import('../../domain/repositories/DebtRepository.js').DebtRepository} debtRepository - The debt repository
   */
  constructor(accountRepository, debtRepository) {
    this.accountRepository = accountRepository;
    this.debtRepository = debtRepository;
  }

  execute(senderName, receiverName, amount) {
    if (senderName === receiverName) {
      throw new Error('Sender and receiver cannot be the same');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    const senderAccount = this.accountRepository.findByName(senderName);
    if (!senderAccount) {
      throw new Error('Sender account not found');
    }

    const receiverAccount = this.accountRepository.findByName(receiverName);
    if (!receiverAccount) {
      throw new Error('Receiver account not found');
    }

    let cashTransferred = 0;
    let debtCreated = 0;

    // If the sender has enough balance, transfer the full amount. Otherwise, transfer the remaining balance.
    cashTransferred = Math.min(senderAccount.balance, amount);

    if (cashTransferred > 0) {
      senderAccount.withdraw(cashTransferred);
      receiverAccount.deposit(cashTransferred);
      this.accountRepository.save(receiverAccount);
      this.accountRepository.save(senderAccount);
    }

    debtCreated = amount - cashTransferred;

    if (debtCreated > 0) {
      let existingDebt = this.debtRepository.findDebtBetween(senderName, receiverName);
      if (existingDebt) {
        existingDebt.amount += debtCreated;
        this.debtRepository.save(existingDebt);
      } else {
        const newDebt = new Debt(senderName, receiverName, debtCreated);
        this.debtRepository.save(newDebt);
      }
    }

    return {
      senderNewBalance: senderAccount.balance,
      cashTransferred: cashTransferred,
      debtCreated: debtCreated
    };
  } 
}