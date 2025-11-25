import { DebtRepository } from '../../domain/repositories/DebtRepository.js';
import { Debt } from '../../domain/entities/Debt.js';

export class PostgresDebtRepository extends DebtRepository {
  constructor(dbClient) {
    super();
    this.db = dbClient;
  }

  async findDebtsByDebtor(debtorName) {
    const result = await this.db.query(
      'SELECT * FROM debts WHERE debtor_name = $1 ORDER BY created_at',
      [debtorName]
    );
    
    return result.rows.map(row => 
      new Debt(row.debtor_name, row.creditor_name, row.amount)
    );
  }

  async findDebtBetween(debtorName, creditorName) {
    const result = await this.db.query(
      'SELECT * FROM debts WHERE debtor_name = $1 AND creditor_name = $2',
      [debtorName, creditorName]
    );
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return new Debt(row.debtor_name, row.creditor_name, row.amount);
  }

  async save(debt) {
    await this.db.query(
      `INSERT INTO debts (debtor_name, creditor_name, amount, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (debtor_name, creditor_name)
       DO UPDATE SET amount = $3`,
      [debt.debtorName, debt.creditorName, debt.amount]
    );
  }

  async remove(debt) {
    await this.db.query(
      'DELETE FROM debts WHERE debtor_name = $1 AND creditor_name = $2',
      [debt.debtorName, debt.creditorName]
    );
  }
}