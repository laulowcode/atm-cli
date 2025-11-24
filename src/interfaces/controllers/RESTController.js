export class RESTController {
  constructor(presenter, sessionManager, useCases) {
    this.presenter = presenter;
    this.session = sessionManager;
    this.useCases = useCases;
  }

  deposit(request, response) {
    const { amount } = request.body;
    const user = this.session.getCurrentUser();
    if (!user) {
      return response.status(401).json(this.presenter.formatError('No user logged in'));
    }
    const depositDto = this.useCases.depositMoney.execute(user, amount);
    response.status(200).json(this.presenter.formatDeposit(depositDto));
  }

  withdraw(request, response) {
    const { amount } = request.body;
    const user = this.session.getCurrentUser();
    if (!user) {
      return response.status(401).json(this.presenter.formatError('No user logged in'));
    }
    const withdrawDto = this.useCases.withdrawMoney.execute(user, amount);
    response.status(200).json(this.presenter.formatWithdraw(withdrawDto));
  }

  transfer(request, response) {
    const { receiverName, amount } = request.body;
    const user = this.session.getCurrentUser();
    if (!user) {
      return response.status(401).json(this.presenter.formatError('No user logged in'));
    }
    const transferDto = this.useCases.transferMoney.execute(user, receiverName, amount);
    response.status(200).json(this.presenter.formatTransfer(transferDto));
  }

  logout(request, response) {
    const user = this.session.getCurrentUser();
    if (!user) {
      return response.status(401).json(this.presenter.formatError('No user logged in'));
    }
    this.useCases.logoutUser.execute(user);
    response.status(200).json(this.presenter.formatLogout());
  }

  login(request, response) {
    const { name } = request.body;
    const loginDto = this.useCases.loginUser.execute(name);
    this.session.login(name);
    response.status(200).json(this.presenter.formatLogin(loginDto));
  }
}