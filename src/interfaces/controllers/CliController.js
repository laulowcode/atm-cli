export class CliController {
  constructor(presenter, sessionManager, useCases) {
    this.presenter = presenter;
    this.session = sessionManager;
    this.useCases = useCases;
  }

  handleCommand(line) {
    try {
      const [command, ...args] = line.trim().split(' ');
      const cmd = command.toLowerCase();

      // LOGIN command - handle separately for unlogged in state
      if (cmd === 'login') {
        const [name] = args;
        if (!name) throw new Error('Name is required');

        const dto = this.useCases.loginUser.execute(name);
        this.session.login(name);
        return this.presenter.formatLogin(dto);
      }

      const currentUser = this.session.getCurrentUser();
      if (!currentUser && cmd !== 'logout') {
        throw new Error('No user is logged in');
      }

      switch (cmd) {
        case 'logout':
          if (!currentUser) throw new Error('No user is logged in');
          this.session.logout();
          return this.presenter.formatLogout({ name: currentUser });

        case 'deposit':
          const depositAmount = parseFloat(args[0]);
          if (isNaN(depositAmount)) throw new Error('Invalid amount');

          const depositDto = this.useCases.depositMoney.execute(currentUser, depositAmount);
          return this.presenter.formatDeposit(depositDto);

        case 'withdraw':
          const withdrawAmount = parseFloat(args[0]);
          if (isNaN(withdrawAmount)) throw new Error('Invalid amount');

          const withdrawDto = this.useCases.withdrawMoney.execute(currentUser, withdrawAmount);
          return this.presenter.formatWithdraw(withdrawDto);

        case 'transfer':
          const [receiverName, transferAmountStr] = args;
          if (!receiverName) throw new Error('Receiver name is required');
          
          const transferAmount = parseFloat(transferAmountStr);
          if (isNaN(transferAmount)) throw new Error('Invalid amount');

          const transferDto = this.useCases.transferMoney.execute(currentUser, receiverName, transferAmount);
          const presenterDto = {
            cashTransferred: transferDto.cashTransferred,
            receiverName: receiverName,
            senderNewBalance: transferDto.senderNewBalance,
            debtOwned: transferDto.debtCreated > 0 ? { amount: transferDto.debtCreated, creditorName: receiverName } : null
          };

          return this.presenter.formatTransfer(presenterDto);

        default:
          throw new Error(`Invalid command: ${cmd}`);
      }
    } catch (error) {
      return this.presenter.formatError(error.message);
    }
  }
}