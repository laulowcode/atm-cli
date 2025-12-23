export class DebtPaymentStrategy {
  /**
   * Sort debts according to specific strategy
   * @param {import('../../../domain/entities/Debt.js').Debt[]} debts
   * @returns {import('../../../domain/entities/Debt.js').Debt[]}
   */
  sort(debts) {
    return Array.isArray(debts) ? [...debts] : [];
  }
}
