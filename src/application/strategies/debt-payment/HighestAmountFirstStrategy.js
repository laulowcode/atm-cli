import { DebtPaymentStrategy } from './DebtPaymentStrategy.js';

export class HighestAmountFirstStrategy extends DebtPaymentStrategy {
  sort(debts) {
    const sorted = super.sort(debts);
    return sorted.sort((a, b) => b.amount - a.amount);
  }
}
