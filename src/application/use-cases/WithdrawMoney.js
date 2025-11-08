export class WithdrawMoney {
  /**
   * @constructor
   * Create a new withdraw money use case
   * @param {import('../../domain/repositories/AccountRepository.js').AccountRepository} accountRepository - The account repository
   */
  constructor(accountRepository) {
    this.accountRepository = accountRepository;
  }
  
  execute(name, amount) {
    const account = this.accountRepository.findByName(name);
    if (!account) {
      throw new Error('Account not found');
    }

    const success = account.withdraw(amount);
    if (!success) {
      throw new Error('Insufficient balance');
    }

    this.accountRepository.save(account);

    return {
      name: account.name,
      balance: account.balance
    };
  }
}