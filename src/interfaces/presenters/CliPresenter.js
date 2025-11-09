export class CliPresenter {
  formatLogin(dto) {
    let output = `Hello, ${dto.name}!`;
    output += `\nYour balance is $${dto.balance}`;
    output += this._formatDebts(dto.debtsOwned, dto.debtsOwnedFromOthers);
    return output;
  }

  formatDeposit(dto) {
    let output = '';

    if (dto.logs && dto.logs.length > 0) {
      output += dto.logs.join('\n') + '\n';
    }

    output += `Your balance is $${dto.balance}`;
    output += this._formatDebts(dto.remainingDebts, []);
    return output;
  }

  formatWithdraw(dto) {
    return `Your balance is $${dto.balance}`
  }

  formatTransfer(dto) {
    let output = '';
    
    const hasCashTransfer = dto.cashTransferred > 0;
    const hasDebtReduction = dto.debtReduced > 0;
    
    if (hasCashTransfer) {
      output += `Transferred $${dto.cashTransferred} to ${dto.receiverName}\n`;
    }
    
    output += `Your balance is $${dto.senderNewBalance}`;

    if (dto.debtOwned && dto.debtOwned.amount > 0) {
      output += `\nOwed $${dto.debtOwned.amount} to ${dto.debtOwned.creditorName}`;
    }
    
    if (dto.receiverOwesBack && dto.receiverOwesBack > 0) {
      output += `\nOwed $${dto.receiverOwesBack} from ${dto.receiverName}`;
    }
    
    return output;
  }

  formatLogout(dto) {
    return `Goodbye, ${dto.name}!`;
  }

  formatError(message) {
    return message;
  }

  /**
   * @private
   * @param {import('../../domain/entities/Debt.js').Debt[]} debtsOwned - The debts owned by the user
   * @param {import('../../domain/entities/Debt.js').Debt[]} debtsOwnedFromOthers - The debts owned by others to the user
   * @returns {string} - The formatted debts
   */
  _formatDebts(debtsOwned = [], debtsOwnedFromOthers = []) {
    let output = '';
    for (const debt of debtsOwned) {
      output += `\nOwed $${debt.amount} to ${debt.creditorName}`;
    }
    for (const debt of debtsOwnedFromOthers) {
      output += `\nOwed $${debt.amount} from ${debt.debtorName}`;
    }
    return output;
  }
}