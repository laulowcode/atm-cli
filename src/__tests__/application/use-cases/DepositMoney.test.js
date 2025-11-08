import { jest } from '@jest/globals';
import { DepositMoney } from '../../../application/use-cases/DepositMoney.js';
import { Account } from '../../../domain/entities/Account.js';

const mockAccountRepository = {
  findByName: jest.fn(),
  save: jest.fn()
};

describe('DepositMoney', () => {
  let depositMoney;

  beforeEach(() => {
    mockAccountRepository.findByName.mockClear();
    mockAccountRepository.save.mockClear();

    depositMoney = new DepositMoney(mockAccountRepository);
  });

  it('should deposit money into an existing account and save it', () => {
    const existingAccount = new Account("John Doe", 100);
    mockAccountRepository.findByName.mockReturnValue(existingAccount);

    const result = depositMoney.execute("John Doe", 50);

    expect(mockAccountRepository.findByName).toHaveBeenCalledWith("John Doe");
    expect(result.balance).toBe(150);
    expect(mockAccountRepository.save).toHaveBeenCalledWith(existingAccount);
  });

  it('should throw an error if the account is not found', () => {
    mockAccountRepository.findByName.mockReturnValue(null);
    expect(() => depositMoney.execute("James", 50)).toThrow('Account not found');
    expect(mockAccountRepository.save).not.toHaveBeenCalled();
  });

  it('should return the updated balance', () => {
    const existingAccount = new Account("John Doe", 100);
    mockAccountRepository.findByName.mockReturnValue(existingAccount);
    const result = depositMoney.execute("John Doe", 50);
    expect(result.balance).toBe(150);
  });
});