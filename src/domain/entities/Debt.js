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
    this.payments = [];
  }

  makePayment(amount, date = new Date()) {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    if (amount > this.amount) {
      throw new Error('Amount must be less than or equal to the debt amount');
    }
    this.amount -= amount;
    this.payments.push({ amount, date });
    return this.amount === 0;
  }

  increaseDebt(amount) {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    this.amount += amount;
  }
}