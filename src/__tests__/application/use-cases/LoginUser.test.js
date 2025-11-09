import { jest } from '@jest/globals';
import { LoginUser } from '../../../application/use-cases/LoginUser.js';
import { Account } from '../../../domain/entities/Account.js';
import { Debt } from '../../../domain/entities/Debt.js';

const mockAccountRepository = {
  findByName: jest.fn(),
  save: jest.fn()
};

const mockDebtRepository = {
  findDebtsByDebtor: jest.fn(),
  findDebtsByCreditor: jest.fn()
};

describe('LoginUser', () => {
  let loginUser;

  beforeEach(() => {
    mockAccountRepository.findByName.mockClear();
    mockAccountRepository.save.mockClear();
    mockDebtRepository.findDebtsByDebtor.mockClear();
    mockDebtRepository.findDebtsByCreditor.mockClear();

    loginUser = new LoginUser(mockAccountRepository, mockDebtRepository);
  });

  it('should create a new account if it does not exist', () => {
    mockAccountRepository.findByName.mockReturnValue(null);
    mockDebtRepository.findDebtsByDebtor.mockReturnValue([]);
    mockDebtRepository.findDebtsByCreditor.mockReturnValue([]);

    const result = loginUser.execute("James");

    expect(mockAccountRepository.save).toHaveBeenCalledWith(expect.objectContaining({ name: "James", balance: 0 }));
    expect(result.name).toBe("James");
    expect(result.balance).toBe(0);
    expect(result.debtsOwned).toEqual([]);
    expect(result.debtsOwnedFromOthers).toEqual([]);
  });

  it('should return existing account and debts', () => {
    const existingAccount = new Account("John Doe");
    const existingDebt = new Debt("John Doe", "Jane Doe", 100);

    mockAccountRepository.findByName.mockReturnValue(existingAccount);
    mockDebtRepository.findDebtsByDebtor.mockReturnValue([existingDebt]);
    mockDebtRepository.findDebtsByCreditor.mockReturnValue([]);

    const result = loginUser.execute("John Doe");
    
    expect(mockAccountRepository.findByName).toHaveBeenCalledWith("John Doe");
    expect(mockAccountRepository.save).not.toHaveBeenCalled();
    expect(mockDebtRepository.findDebtsByDebtor).toHaveBeenCalledWith("John Doe");
    expect(result.balance).toBe(existingAccount.balance);
    expect(result.debtsOwned.length).toBe(1);
    expect(result.debtsOwned[0].amount).toBe(100);
  });

  it('should return debts owed from others (Jane sees John owes her)', () => {
    const janeAccount = new Account("Jane Doe", 50);
    const debtFromJohn = new Debt("John Doe", "Jane Doe", 100);

    mockAccountRepository.findByName.mockReturnValue(janeAccount);
    mockDebtRepository.findDebtsByDebtor.mockReturnValue([]);
    mockDebtRepository.findDebtsByCreditor.mockReturnValue([debtFromJohn]);

    const result = loginUser.execute("Jane Doe");
    
    expect(mockAccountRepository.findByName).toHaveBeenCalledWith("Jane Doe");
    expect(mockDebtRepository.findDebtsByDebtor).toHaveBeenCalledWith("Jane Doe");
    expect(mockDebtRepository.findDebtsByCreditor).toHaveBeenCalledWith("Jane Doe");
    
    expect(result.name).toBe("Jane Doe");
    expect(result.balance).toBe(50);
    expect(result.debtsOwned).toEqual([]);
    expect(result.debtsOwnedFromOthers.length).toBe(1);
    expect(result.debtsOwnedFromOthers[0].debtorName).toBe("John Doe");
    expect(result.debtsOwnedFromOthers[0].amount).toBe(100);
  });
});