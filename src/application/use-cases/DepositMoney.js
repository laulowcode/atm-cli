export class DepositMoney {
  /**
   * @constructor
   * Create a new deposit money use case
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

    account.deposit(amount);
    this.accountRepository.save(account);

    return {
      name: account.name,
      balance: account.balance
    };
  }
}