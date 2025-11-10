import { jest } from '@jest/globals';
import { WithdrawMoney } from '../../../application/use-cases/WithdrawMoney.js';
import { Account } from '../../../domain/entities/Account.js';

const mockAccountRepository = {
  findByName: jest.fn(),
  save: jest.fn()
};

describe('WithdrawMoney', () => {
  let withdrawMoney;

  beforeEach(() => {
    mockAccountRepository.findByName.mockClear();
    mockAccountRepository.save.mockClear();

    withdrawMoney = new WithdrawMoney(mockAccountRepository);
  });

  it('should withdraw money from an existing account and save it', () => {
    const existingAccount = new Account("Alice", 100);
    mockAccountRepository.findByName.mockReturnValue(existingAccount);

    const result = withdrawMoney.execute("Alice", 50);

    expect(mockAccountRepository.findByName).toHaveBeenCalledWith("Alice");
    expect(result.balance).toBe(50);
    expect(mockAccountRepository.save).toHaveBeenCalledWith(existingAccount);
  });

  it('should throw an error if the account is not found', () => {
    mockAccountRepository.findByName.mockReturnValue(null);
    expect(() => withdrawMoney.execute("James", 50)).toThrow('Account not found');
    expect(mockAccountRepository.save).not.toHaveBeenCalled();
  });

  it('should throw an error if the account has insufficient balance', () => {
    const existingAccount = new Account("Alice", 100);
    mockAccountRepository.findByName.mockReturnValue(existingAccount);
    expect(() => withdrawMoney.execute("Alice", 150)).toThrow('Insufficient balance');
  });

  it('should throw error if amount is less than or equal to 0', () => {
    const existingAccount = new Account("Alice", 100);
    mockAccountRepository.findByName.mockReturnValue(existingAccount);
    expect(() => withdrawMoney.execute("Alice", 0)).toThrow('Amount must be greater than 0');
    expect(() => withdrawMoney.execute("Alice", -100)).toThrow('Amount must be greater than 0');
    expect(() => withdrawMoney.execute("Alice", -50)).toThrow('Amount must be greater than 0');
    expect(mockAccountRepository.save).not.toHaveBeenCalled();
  });

  it('should return the updated balance', () => {
    const existingAccount = new Account("Alice", 100);
    mockAccountRepository.findByName.mockReturnValue(existingAccount);
    const result = withdrawMoney.execute("Alice", 50);
    expect(result.balance).toBe(50);
  });
});