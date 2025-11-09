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
    let debtReduced = 0;
    let debtCreated = 0;

    const receiverDebtToSender = this.debtRepository.findDebtBetween(receiverName, senderName);

    let remainingTransfer = amount;
  
    // Priority 1: Reduce receiver's debt (debt forgiveness - no withdrawal)
    if (receiverDebtToSender && receiverDebtToSender.amount > 0) {
      const debtReduction = Math.min(remainingTransfer, receiverDebtToSender.amount);
      
      receiverDebtToSender.amount -= debtReduction;
      if (receiverDebtToSender.amount <= 0) {
        this.debtRepository.remove(receiverDebtToSender);
      } else {
        this.debtRepository.save(receiverDebtToSender);
      }
      
      debtReduced = debtReduction;
      remainingTransfer -= debtReduction;
    }

    // Priority 2: Transfer remaining cash (only if debt is cleared and amount > debt)
    if (remainingTransfer > 0) {
      cashTransferred = Math.min(senderAccount.balance, remainingTransfer);
      
      if (cashTransferred > 0) {
        senderAccount.withdraw(cashTransferred);
        receiverAccount.deposit(cashTransferred);
        this.accountRepository.save(senderAccount);
        this.accountRepository.save(receiverAccount);
        remainingTransfer -= cashTransferred;
      }
    }

    // Priority 3: Create/add debt (if not enough money)
    if (remainingTransfer > 0) {
      const senderDebtToReceiver = this.debtRepository.findDebtBetween(senderName, receiverName);
      if (senderDebtToReceiver) {
        senderDebtToReceiver.amount += remainingTransfer;
        this.debtRepository.save(senderDebtToReceiver);
      } else {
        const newDebt = new Debt(senderName, receiverName, remainingTransfer);
        this.debtRepository.save(newDebt);
      }
      debtCreated = remainingTransfer;
    }

    const receiverRemainingDebt = this.debtRepository.findDebtBetween(receiverName, senderName);

    return {
      senderNewBalance: senderAccount.balance,
      amount: amount,
      cashTransferred: cashTransferred,
      debtReduced: debtReduced,
      debtCreated: debtCreated,
      receiverOwesBack: receiverRemainingDebt ? receiverRemainingDebt.amount : 0
    };
  } 
}