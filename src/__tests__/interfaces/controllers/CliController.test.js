import { jest } from '@jest/globals';
import { CliController } from '../../../interfaces/controllers/CliController.js';

const mockPresenter = {
  formatLogin: jest.fn(),
  formatDeposit: jest.fn(),
  formatWithdraw: jest.fn(),
  formatTransfer: jest.fn(),
  formatLogout: jest.fn(),
  formatError: jest.fn()
};

const mockSession = {
  login: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn()
};

const mockUseCases = {
  loginUser: { execute: jest.fn() },
  depositMoney: { execute: jest.fn() },
  withdrawMoney: { execute: jest.fn() },
  transferMoney: { execute: jest.fn() }
};

describe('CliController', () => {
  let controller;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    controller = new CliController(mockPresenter, mockSession, mockUseCases);
  });

  it('should call LoginUser use case on login command', () => {
    const dto = { name: 'Alice', balance: 0, debtsOwned: [], debtsOwnedFromOthers: [] };
    mockUseCases.loginUser.execute.mockReturnValue(dto);
    mockPresenter.formatLogin.mockReturnValue('Hello Alice!\nYour balance is $0');

    const output = controller.handleCommand('login Alice');
    expect(mockUseCases.loginUser.execute).toHaveBeenCalledWith('Alice');
    expect(mockSession.login).toHaveBeenCalledWith('Alice');
    expect(mockPresenter.formatLogin).toHaveBeenCalledWith(dto);
    expect(output).toBe('Hello Alice!\nYour balance is $0');
  });

  it('should call DepositMoney use case on deposit command', () => {
    mockSession.getCurrentUser.mockReturnValue('Alice');
    const dto = { balance: 100, remainingDebts: [] };
    mockUseCases.depositMoney.execute.mockReturnValue(dto);
    mockPresenter.formatDeposit.mockReturnValue('Your balance is $100');

    const output = controller.handleCommand('deposit 100');
    expect(mockUseCases.depositMoney.execute).toHaveBeenCalledWith('Alice', 100);
    expect(mockPresenter.formatDeposit).toHaveBeenCalledWith(dto);
    expect(output).toBe('Your balance is $100');
  });

  it('should call WithdrawMoney use case on withdraw command', () => {
    mockSession.getCurrentUser.mockReturnValue('Alice');
    const dto = { name: 'Alice', balance: 50 };
    mockUseCases.withdrawMoney.execute.mockReturnValue(dto);
    mockPresenter.formatWithdraw.mockReturnValue('Your balance is $50');

    const output = controller.handleCommand('withdraw 50');
    expect(mockUseCases.withdrawMoney.execute).toHaveBeenCalledWith('Alice', 50);
    expect(mockPresenter.formatWithdraw).toHaveBeenCalledWith(dto);
    expect(output).toBe('Your balance is $50');
  });

  it('should call TransferMoney use case on transfer command', () => {
    mockSession.getCurrentUser.mockReturnValue('Alice');

    const useCaseDto = { cashTransferred: 30, senderNewBalance: 100, debtCreated: 70 };
    mockUseCases.transferMoney.execute.mockReturnValue(useCaseDto);
    
    mockPresenter.formatTransfer.mockReturnValue('Transferred $30 to Bob.\nYour balance is $100');

    const output = controller.handleCommand('transfer Bob 100');
    expect(mockUseCases.transferMoney.execute).toHaveBeenCalledWith('Alice', 'Bob', 100);
    const presenterDto = {
      cashTransferred: useCaseDto.cashTransferred,
      receiverName: 'Bob',
      senderNewBalance: useCaseDto.senderNewBalance,
      debtCreated: useCaseDto.debtCreated
    };
    expect(mockPresenter.formatTransfer).toHaveBeenCalledWith(presenterDto);
    expect(output).toBe('Transferred $30 to Bob.\nYour balance is $100');
  });

  it('should call presenter formatError if use case throws an error', () => {
    mockSession.getCurrentUser.mockReturnValue('Alice');
    const error = new Error('Insufficient balance');
    mockUseCases.withdrawMoney.execute.mockImplementation(() => {
      throw error;
    });
    mockPresenter.formatError.mockReturnValue('Insufficient balance');
    
    const output = controller.handleCommand('withdraw 1000');
    expect(mockUseCases.withdrawMoney.execute).toHaveBeenCalled();
    expect(mockPresenter.formatError).toHaveBeenCalledWith(error.message);
    expect(output).toBe('Insufficient balance');
  });

  it('should return error if not logged in for protected commands', () => {
    jest.clearAllMocks();
    mockSession.getCurrentUser.mockReturnValue(null);
    mockPresenter.formatError.mockReturnValue('No user is logged in');
    
    const output = controller.handleCommand('deposit 100');
    
    expect(mockUseCases.depositMoney.execute).not.toHaveBeenCalled();
    expect(mockPresenter.formatError).toHaveBeenCalledWith('No user is logged in');
    expect(output).toBe('No user is logged in');
  });

  it('should call logout and return formatted message', () => {
    mockSession.getCurrentUser.mockReturnValue('Alice');
    mockPresenter.formatLogout.mockReturnValue('Goodbye Alice!');
    
    const output = controller.handleCommand('logout');
    
    expect(mockSession.logout).toHaveBeenCalled();
    expect(mockPresenter.formatLogout).toHaveBeenCalledWith({ name: 'Alice' });
    expect(output).toBe('Goodbye Alice!');
  });

  it('should return error when trying to logout without login', () => {
    mockSession.getCurrentUser.mockReturnValue(null);
    mockPresenter.formatError.mockReturnValue('No user is logged in');
    
    const output = controller.handleCommand('logout');
    
    expect(mockSession.logout).not.toHaveBeenCalled();
    expect(mockPresenter.formatError).toHaveBeenCalledWith('No user is logged in');
    expect(output).toBe('No user is logged in');
  });

  it('should return error for invalid command', () => {
    mockSession.getCurrentUser.mockReturnValue('Alice');
    mockPresenter.formatError.mockReturnValue('Invalid command: help');
    
    const output = controller.handleCommand('help');
    
    expect(mockPresenter.formatError).toHaveBeenCalledWith('Invalid command: help');
    expect(output).toBe('Invalid command: help');
  });

  it('should return error when login without name', () => {
    mockPresenter.formatError.mockReturnValue('Name is required');
    
    const output = controller.handleCommand('login');
    
    expect(mockUseCases.loginUser.execute).not.toHaveBeenCalled();
    expect(mockSession.login).not.toHaveBeenCalled();
    expect(mockPresenter.formatError).toHaveBeenCalledWith('Name is required');
    expect(output).toBe('Name is required');
  });

  it('should return error when deposit with invalid amount', () => {
    mockSession.getCurrentUser.mockReturnValue('Alice');
    mockPresenter.formatError.mockReturnValue('Invalid amount');
    
    const output = controller.handleCommand('deposit abc');
    
    expect(mockUseCases.depositMoney.execute).not.toHaveBeenCalled();
    expect(mockPresenter.formatError).toHaveBeenCalledWith('Invalid amount');
    expect(output).toBe('Invalid amount');
  });

  it('should return error when withdraw with invalid amount', () => {
    mockSession.getCurrentUser.mockReturnValue('Alice');
    mockPresenter.formatError.mockReturnValue('Invalid amount');
    
    const output = controller.handleCommand('withdraw xyz');
    
    expect(mockUseCases.withdrawMoney.execute).not.toHaveBeenCalled();
    expect(mockPresenter.formatError).toHaveBeenCalledWith('Invalid amount');
    expect(output).toBe('Invalid amount');
  });

  it('should return error when transfer without receiver name', () => {
    mockSession.getCurrentUser.mockReturnValue('Alice');
    mockPresenter.formatError.mockReturnValue('Receiver name is required');
    
    const output = controller.handleCommand('transfer');
    
    expect(mockUseCases.transferMoney.execute).not.toHaveBeenCalled();
    expect(mockPresenter.formatError).toHaveBeenCalledWith('Receiver name is required');
    expect(output).toBe('Receiver name is required');
  });

  it('should return error when transfer with invalid amount', () => {
    mockSession.getCurrentUser.mockReturnValue('Alice');
    mockPresenter.formatError.mockReturnValue('Invalid amount');
    
    const output = controller.handleCommand('transfer Bob invalid');
    
    expect(mockUseCases.transferMoney.execute).not.toHaveBeenCalled();
    expect(mockPresenter.formatError).toHaveBeenCalledWith('Invalid amount');
    expect(output).toBe('Invalid amount');
  });
});