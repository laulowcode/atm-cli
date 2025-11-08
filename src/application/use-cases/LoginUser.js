import { Account } from '../../domain/entities/Account.js';

export class LoginUser {
  /**
   * @constructor
   * Create a new login user use case
   * @param {import('../../domain/repositories/AccountRepository.js').AccountRepository} accountRepository - The account repository
   * @param {import('../../domain/repositories/DebtRepository.js').DebtRepository} debtRepository - The debt repository
   */
  constructor(accountRepository, debtRepository) {
    this.accountRepository = accountRepository;
    this.debtRepository = debtRepository;
  }

  execute(name) {
    let account = this.accountRepository.findByName(name);
  
    if (!account) {
      account = new Account(name);
      this.accountRepository.save(account);
    }

    const debtsOwned = this.debtRepository.findDebtsByDebtor(name);
    const debtsOwnedFromOthers = this.debtRepository.findDebtsByCreditor(name);

    return {
      name: account.name,
      balance: account.balance,
      debtsOwned,
      debtsOwnedFromOthers
    };
  }
}