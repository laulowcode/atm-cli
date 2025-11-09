export class DepositMoney {
  /**
   * @constructor
   * Create a new deposit money use case
   * @param {import('../../domain/repositories/AccountRepository.js').AccountRepository} accountRepository - The account repository
   * @param {import('../../domain/repositories/DebtRepository.js').DebtRepository} debtRepository - The debt repository
   */
  constructor(accountRepository, debtRepository) {
    this.accountRepository = accountRepository;
    this.debtRepository = debtRepository;
  }

  execute(name, amount) {
    const account = this.accountRepository.findByName(name);
    if (!account) {
      throw new Error('Account not found');
    }

    let remainingAmount = amount;
    const transferLogs = [];

    // Begin to pay off debts
    const debts = this.debtRepository.findDebtsByDebtor(name);

    for (const debt of debts) {
      if (remainingAmount <= 0) {
        break;
      }
  
      const creditorAccount = this.accountRepository.findByName(debt.creditorName);
      if (!creditorAccount) {
        continue;
      }

      // Step 1: Calculate the amount to pay off the debt
      const paymentAmount = Math.min(remainingAmount, debt.amount);

      creditorAccount.deposit(paymentAmount);
      this.accountRepository.save(creditorAccount);

      // Step 2: Update the remaining amount
      remainingAmount -= paymentAmount;

      // Step 3: Update the transfer logs
      debt.amount -= paymentAmount;
      if (debt.amount <= 0) {
        this.debtRepository.remove(debt);
      } else {
        this.debtRepository.save(debt);
      }

      transferLogs.push(`Transferred $${paymentAmount} to ${creditorAccount.name}`);
    }

    // After all debts are paid off, NOW deposit the remaining amount into the account
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
}