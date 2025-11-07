export class Debt {
  /**
   * @constructor
   * Create a new debt
   * @param {string} debtorName - The name of the debtor
   * @param {string} creditorName - The name of the creditor
   * @param {number} amount - The amount of the debt
   */
  constructor(debtorName, creditorName, amount) {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    this.debtorName = debtorName;
    this.creditorName = creditorName;
    this.amount = amount;
  }
}