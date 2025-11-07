import { AccountRepository } from '../../domain/repositories/AccountRepository.js';

export class InMemoryAccountRepository extends AccountRepository {
  /**
   * @constructor
   * Create a new in memory account repository
   */
  static accounts = new Map();

  constructor() {
    super();
  }

  /**
   * @param {string} name - The name of the account to find
   * @returns {import('../../domain/entities/Account.js').Account | null} - The account if found, otherwise null
   */
  findByName(name) {
    return this.constructor.accounts.get(name) || null;
  }

  /**
   * @param {import('../../domain/entities/Account.js').Account} account - The account to save
   */
  save(account) {
    this.constructor.accounts.set(account.name, account);
  }
}