import { DebtPaymentStrategy } from './DebtPaymentStrategy.js';

export class OldestDebtFirstStrategy extends DebtPaymentStrategy {
  sort(debts) {
    return super.sort(debts); // preserve existing order (assumed oldest first)
  }
}
