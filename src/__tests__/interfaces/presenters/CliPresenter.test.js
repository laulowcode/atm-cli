import { CliPresenter } from '../../../interfaces/presenters/CliPresenter.js';

describe('CliPresenter', () => {
  let presenter;

  beforeEach(() => {
    presenter = new CliPresenter();
  });

  it('should format the login output correctly (no debt)', () => {
    const dto = { name: 'Alice', balance: 100, debtsOwned: [], debtsOwnedFromOthers: [] };
    const result = presenter.formatLogin(dto);
    expect(result).toBe('Hello, Alice!\nYour balance is $100');
  });

  it('should format the login output correctly (with debt)', () => {
    const dto = { name: 'Alice', balance: 100, debtsOwned: [{ amount: 100, creditorName: 'Bob' }], debtsOwnedFromOthers: [] };
    const result = presenter.formatLogin(dto);
    expect(result).toBe('Hello, Alice!\nYour balance is $100\nOwed $100 to Bob');
  });

  it('should format the login output correctly (with debt owed from others)', () => {
    const dto = { 
      name: 'Alice', 
      balance: 100, 
      debtsOwned: [], 
      debtsOwnedFromOthers: [{ amount: 50, debtorName: 'Bob' }] 
    };
    const result = presenter.formatLogin(dto);
    expect(result).toBe('Hello, Alice!\nYour balance is $100\nOwed $50 from Bob');
  });

  it('should format the login output correctly (with both types of debt)', () => {
    const dto = { 
      name: 'Alice', 
      balance: 100, 
      debtsOwned: [{ amount: 100, creditorName: 'Bob' }],
      debtsOwnedFromOthers: [{ amount: 50, debtorName: 'Charlie' }]
    };
    const result = presenter.formatLogin(dto);
    expect(result).toBe('Hello, Alice!\nYour balance is $100\nOwed $100 to Bob\nOwed $50 from Charlie');
  });

  it('should format the deposit output correctly (with remaining debts)', () => {
    const dto = { 
      amount: 100, 
      balance: 50, 
      remainingDebts: [{ amount: 50, creditorName: 'Bob' }] 
    };
    const result = presenter.formatDeposit(dto);
    expect(result).toBe('Your balance is $50\nOwed $50 to Bob');
  });

  it('should format the withdraw output correctly', () => {
    const dto = { balance: 100 };
    const result = presenter.formatWithdraw(dto);
    expect(result).toBe('Your balance is $100');
  });

  it('should format the transfer output correctly (without debt)', () => {
    const dto = { 
      cashTransferred: 50, 
      receiverName: 'Bob', 
      senderNewBalance: 50,
      debtOwned: null
    };
    const result = presenter.formatTransfer(dto);
    expect(result).toBe('Transferred $50 to Bob\nYour balance is $50');
  });

  it('should format the transfer output correctly', () => {
    const dto = { cashTransferred: 100, receiverName: 'Bob', senderNewBalance: 100, debtOwned: { amount: 100, creditorName: 'Bob' } };
    const result = presenter.formatTransfer(dto);
    expect(result).toBe('Transferred $100 to Bob\nYour balance is $100\nOwed $100 to Bob');
  });

  it('should format the logout output correctly', () => {
    const dto = { name: 'Alice' };
    const result = presenter.formatLogout(dto);
    expect(result).toBe('Goodbye, Alice!');
  });

  it('should format error message correctly', () => {
    const result = presenter.formatError('Insufficient balance');
    expect(result).toBe('Insufficient balance');
  });

  it('should format the login output correctly (with null/undefined debts)', () => {
    const dto = { 
      name: 'Alice', 
      balance: 100, 
      debtsOwned: undefined,
      debtsOwnedFromOthers: undefined 
    };
    const result = presenter.formatLogin(dto);
    expect(result).toBe('Hello, Alice!\nYour balance is $100');
  });
});