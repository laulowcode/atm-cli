import { AccountRepository } from '../../domain/repositories/AccountRepository.js';
import { Account } from '../../domain/entities/Account.js';

export class PostgresAccountRepository extends AccountRepository {
  constructor(dbClient) {
    super();
    this.db = dbClient; // pg client
  }

  async findByName(name) {
    const result = await this.db.query(
      'SELECT * FROM accounts WHERE name = $1',
      [name]
    );
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return new Account(row.name, row.balance);
  }

  async save(account) {
    await this.db.query(
      `INSERT INTO accounts (name, balance) 
       VALUES ($1, $2)
       ON CONFLICT (name) 
       DO UPDATE SET balance = $2`,
      [account.name, account.balance]
    );
  }
}