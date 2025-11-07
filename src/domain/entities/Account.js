export class Account {
  /**
   * @constructor
   * Create a new account
   * @param {string} name - The name of the account holder
   * @param {number} balance - The initial balance of the account
   */
  constructor(name, balance = 0 ) {
    this.name = name;
    this.balance = balance;
  }

  deposit(amount) {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    this.balance += amount;
  }

  withdraw(amount) {
    if (amount <= 0) {  
      throw new Error('Amount must be greater than 0');
    }
    if (amount > this.balance) return false;

    this.balance -= amount;
    return true;
  }
}