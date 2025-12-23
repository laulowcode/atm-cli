export class RESTPresenter {
  formatLogin(dto) {
    return {
      message: `Hello, ${dto.name}!`,
      data: {
        name: dto.name,
        balance: dto.balance,
        debtsOwned: dto.debtsOwned,
        debtsOwnedFromOthers: dto.debtsOwnedFromOthers
      }
    };
  }

  formatDeposit(dto) {
    return {
      message: 'Deposit successful',
      data: {
        balance: dto.balance,
        logs: dto.logs,
        remainingDebts: dto.remainingDebts
      }
    };
  }

  formatWithdraw(dto) {
    return {
      message: 'Withdrawal successful',
      data: {
        balance: dto.balance
      }
    };
  }

  formatTransfer(dto) {
    return {
      message: 'Transfer successful',
      data: {
        senderNewBalance: dto.senderNewBalance,
        cashTransferred: dto.cashTransferred,
        debtReduced: dto.debtReduced,
        debtCreated: dto.debtCreated,
        receiverOwesBack: dto.receiverOwesBack
      }
    };
  }

  formatLogout() {
    return {
      message: 'Logged out successfully'
    };
  }

  formatError(message) {
    return {
      error: true,
      message: message
    };
  }
}