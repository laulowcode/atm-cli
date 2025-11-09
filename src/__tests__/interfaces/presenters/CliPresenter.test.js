import { CliPresenter } from '../../../interfaces/presenters/CliPresenter.js';

describe('CliPresenter', () => {
  let presenter;

  beforeEach(() => {
    presenter = new CliPresenter();
  });

  it('should format the login output correctly (no debt)', () => {
    const dto = { name: 'John Doe', balance: 100, debtsOwned: [], debtsOwnedFromOthers: [] };
    const result = presenter.formatLogin(dto);
    expect(result).toBe('Hello John Doe!\nYour balance is $100.');
  });

  it('should format the login output correctly (with debt)', () => {
    const dto = { name: 'John Doe', balance: 100, debtsOwned: [{ amount: 100, creditorName: 'Jane Doe' }], debtsOwnedFromOthers: [] };
    const result = presenter.formatLogin(dto);
    expect(result).toBe('Hello John Doe!\nYour balance is $100.\nOwed $100 to Jane Doe');
  });

  it('should format the login output correctly (with debt owed from others)', () => {
    const dto = { 
      name: 'John Doe', 
      balance: 100, 
      debtsOwned: [], 
      debtsOwnedFromOthers: [{ amount: 50, debtorName: 'Jane Doe' }] 
    };
    const result = presenter.formatLogin(dto);
    expect(result).toBe('Hello John Doe!\nYour balance is $100.\nOwed $50 from Jane Doe');
  });

  it('should format the login output correctly (with both types of debt)', () => {
    const dto = { 
      name: 'John Doe', 
      balance: 100, 
      debtsOwned: [{ amount: 100, creditorName: 'Jane Doe' }],
      debtsOwnedFromOthers: [{ amount: 50, debtorName: 'James Doe' }]
    };
    const result = presenter.formatLogin(dto);
    expect(result).toBe('Hello John Doe!\nYour balance is $100.\nOwed $100 to Jane Doe\nOwed $50 from James Doe');
  });

  it('should format the deposit output correctly', () => {
    const dto = { amount: 100, balance: 100, remainingDebts: [] };
    const result = presenter.formatDeposit(dto);
    expect(result).toBe('Your balance is $100.');
  });

  it('should format the withdraw output correctly', () => {
    const dto = { balance: 100 };
    const result = presenter.formatWithdraw(dto);
    expect(result).toBe('Your balance is $100.');
  });

  it('should format the transfer output correctly (without debt)', () => {
    const dto = { 
      cashTransferred: 50, 
      receiverName: 'Jane Doe', 
      senderNewBalance: 50,
      debtOwned: null
    };
    const result = presenter.formatTransfer(dto);
    expect(result).toBe('Transferred $50 to Jane Doe.\nYour balance is $50.');
  });

  it('should format the transfer output correctly', () => {
    const dto = { cashTransferred: 100, receiverName: 'Jane Doe', senderNewBalance: 100, debtOwned: { amount: 100, creditorName: 'Jane Doe' } };
    const result = presenter.formatTransfer(dto);
    expect(result).toBe('Transferred $100 to Jane Doe.\nYour balance is $100.\nOwed $100 to Jane Doe');
  });

  it('should format the logout output correctly', () => {
    const dto = { name: 'John Doe' };
    const result = presenter.formatLogout(dto);
    expect(result).toBe('Goodbye John Doe!');
  });
});