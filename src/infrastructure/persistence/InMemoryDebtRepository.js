import { DebtRepository } from '../../domain/repositories/DebtRepository.js';

export class InMemoryDebtRepository extends DebtRepository {
  /**
   * @constructor
   * Create a new in memory debt repository
   */
  static debts = [];

  constructor() {
    super();
  }

  /**
   * @param {string} debtorName - The name of the debtor to find
   * @returns {import('../../domain/entities/Debt.js').Debt[]} - The debts if found, otherwise empty array
   */
  findDebtsByDebtor(debtorName) {
    return this.constructor.debts.filter(debt => debt.debtorName === debtorName);
  }

  /**
   * @param {string} creditorName - The name of the creditor to find
   * @returns {import('../../domain/entities/Debt.js').Debt[]} - The debts if found, otherwise empty array
   */
  findDebtsByCreditor(creditorName) {
    return this.constructor.debts.filter(debt => debt.creditorName === creditorName);
  }

  /**
   * @param {string} debtorName - The name of the debtor to find
   * @param {string} creditorName - The name of the creditor to find
   * @returns {import('../../domain/entities/Debt.js').Debt[]} - The debts if found, otherwise empty array
   */
  findDebtBetween(debtorName, creditorName) {
    return this.constructor.debts.find(debt => debt.debtorName === debtorName && debt.creditorName === creditorName);
  }

  /**
   * @param {import('../../domain/entities/Debt.js').Debt} debt - The debt to save
   */
  save(debt) {
    const existingDebt = this.findDebtBetween(debt.debtorName, debt.creditorName);
    if (!existingDebt) {
      this.constructor.debts.push(debt);
    }
  }

  /**
   * @param {import('../../domain/entities/Debt.js').Debt} debt - The debt to remove
   */
  remove(debt) {
    const index = this.constructor.debts.findIndex(d => d.debtorName === debt.debtorName && d.creditorName === debt.creditorName);
    
    if (index !== -1) {
      this.constructor.debts.splice(index, 1);
    }
  }
}