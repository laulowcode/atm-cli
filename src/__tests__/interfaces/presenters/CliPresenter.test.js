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

  it('should format the deposit output correctly (no debt payment)', () => {
    const dto = { 
      balance: 100,
      logs: [],
      remainingDebts: [] 
    };
    const result = presenter.formatDeposit(dto);
    expect(result).toBe('Your balance is $100');
  });

  it('should format the deposit output correctly (with debt payment)', () => {
    const dto = { 
      balance: 0,
      logs: ['Transferred $30 to Alice'],
      remainingDebts: [{ amount: 40, creditorName: 'Alice' }] 
    };
    const result = presenter.formatDeposit(dto);
    expect(result).toBe('Transferred $30 to Alice\nYour balance is $0\nOwed $40 to Alice');
  });

  it('should format the deposit output correctly (full debt payment)', () => {
    const dto = { 
      balance: 20,
      logs: ['Transferred $50 to Alice'],
      remainingDebts: [] 
    };
    const result = presenter.formatDeposit(dto);
    expect(result).toBe('Transferred $50 to Alice\nYour balance is $20');
  });

  it('should format the deposit output correctly (multiple debt payments)', () => {
    const dto = { 
      balance: 0,
      logs: ['Transferred $30 to Alice', 'Transferred $20 to Bob'],
      remainingDebts: [{ amount: 10, creditorName: 'Charlie' }] 
    };
    const result = presenter.formatDeposit(dto);
    expect(result).toBe('Transferred $30 to Alice\nTransferred $20 to Bob\nYour balance is $0\nOwed $10 to Charlie');
  });

  it('should format the withdraw output correctly', () => {
    const dto = { balance: 100 };
    const result = presenter.formatWithdraw(dto);
    expect(result).toBe('Your balance is $100');
  });

  it('should format the transfer output correctly (cash only)', () => {
    const dto = { 
      amount: 50,
      cashTransferred: 50,
      debtReduced: 0,
      debtCreated: 0,
      receiverName: 'Bob', 
      senderNewBalance: 50,
      debtOwned: null,
      receiverOwesBack: 0
    };
    const result = presenter.formatTransfer(dto);
    expect(result).toBe('Transferred $50 to Bob\nYour balance is $50');
  });

  it('should format the transfer output correctly (cash + debt creation)', () => {
    const dto = { 
      amount: 100,
      cashTransferred: 30,
      debtReduced: 0,
      debtCreated: 70,
      receiverName: 'Bob', 
      senderNewBalance: 0, 
      debtOwned: { amount: 70, creditorName: 'Bob' },
      receiverOwesBack: 0
    };
    const result = presenter.formatTransfer(dto);
    expect(result).toBe('Transferred $30 to Bob\nYour balance is $0\nOwed $70 to Bob');
  });

  it('should format the transfer output correctly (debt forgiveness only)', () => {
    const dto = { 
      amount: 30,
      cashTransferred: 0,
      debtReduced: 30,
      debtCreated: 0,
      receiverName: 'Bob', 
      senderNewBalance: 210, 
      debtOwned: null,
      receiverOwesBack: 10
    };
    const result = presenter.formatTransfer(dto);
    expect(result).toBe('Your balance is $210\nOwed $10 from Bob');
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