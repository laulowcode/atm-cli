import { jest } from '@jest/globals';
import { DepositMoney } from '../../../application/use-cases/DepositMoney.js';
import { Account } from '../../../domain/entities/Account.js';
import { Debt } from '../../../domain/entities/Debt.js';

const mockAccountRepository = {
  findByName: jest.fn(),
  save: jest.fn()
};

const mockDebtRepository = {
  findDebtsByDebtor: jest.fn(),
  findDebtBetween: jest.fn(),
  save: jest.fn(),
  remove: jest.fn()
};

describe('DepositMoney', () => {
  let depositMoney;
  let debtorAccount;
  let creditorAccount;
  let thirdAccount;

  beforeEach(() => {
    mockAccountRepository.findByName.mockClear();
    mockAccountRepository.save.mockClear();
    mockDebtRepository.findDebtsByDebtor.mockClear();
    mockDebtRepository.findDebtBetween.mockClear();
    mockDebtRepository.save.mockClear();
    mockDebtRepository.remove.mockClear();

    depositMoney = new DepositMoney(mockAccountRepository, mockDebtRepository);

    debtorAccount = new Account("John Doe", 10);
    creditorAccount = new Account("Jane Doe", 50);
    thirdAccount = new Account("James Doe", 0);

    mockAccountRepository.findByName.mockImplementation((name) => {
      if (name === "John Doe") return debtorAccount;
      if (name === "Jane Doe") return creditorAccount;
      if (name === "James Doe") return thirdAccount;
      return null;
    });
  });

  it('should throw an error if the account is not found', () => {
    mockAccountRepository.findByName.mockReturnValue(null);
    expect(() => depositMoney.execute("James", 50)).toThrow('Account not found');
    expect(mockAccountRepository.save).not.toHaveBeenCalled();
  });

  it('should deposit to balance if no debt is found', () => {
    mockDebtRepository.findDebtsByDebtor.mockReturnValue([]);
    
    const result = depositMoney.execute("John Doe", 100);

    expect(debtorAccount.balance).toBe(110);
    expect(mockAccountRepository.save).toHaveBeenCalledWith(debtorAccount);
    expect(mockDebtRepository.save).not.toHaveBeenCalled();
    expect(mockDebtRepository.remove).not.toHaveBeenCalled();
    expect(result.finalBalance).toBe(110);
    expect(result.logs).toEqual([]);
  });

  it('should pay off partial debt (debt amount is greater than deposit amount)', () => {
    const debt = new Debt("John Doe", "Jane Doe", 70);
    mockDebtRepository.findDebtsByDebtor.mockReturnValue([debt]);

    const result = depositMoney.execute("John Doe", 30);

    expect(debtorAccount.balance).toBe(10);
    // 'save' should not be called for debtor account as the balance is not changed (30 < 70)
    expect(mockAccountRepository.save).not.toHaveBeenCalledWith(debtorAccount);
    
    expect(creditorAccount.balance).toBe(80); // 50 + 30
    expect(mockAccountRepository.save).toHaveBeenCalledWith(creditorAccount);

    expect(debt.amount).toBe(40); // 70 - 30
    expect(mockDebtRepository.save).toHaveBeenCalledWith(debt);
    expect(mockDebtRepository.remove).not.toHaveBeenCalled(); // Debt is not fully paid off yet

    expect(result.finalBalance).toBe(10);
    expect(result.logs).toEqual(['Transferred 30 to Jane Doe']);
  });

  it('should pay off full debt (debt amount is equal to deposit amount)', () => {
    const debt = new Debt("John Doe", "Jane Doe", 70);
    mockDebtRepository.findDebtsByDebtor.mockReturnValue([debt]);

    const result = depositMoney.execute("John Doe", 70);

    expect(debtorAccount.balance).toBe(10);
    expect(mockAccountRepository.save).not.toHaveBeenCalledWith(debtorAccount);
    
    expect(creditorAccount.balance).toBe(120); // 50 + 70
    expect(mockAccountRepository.save).toHaveBeenCalledWith(creditorAccount);

    expect(debt.amount).toBe(0); // 70 - 70
    expect(mockDebtRepository.save).not.toHaveBeenCalled();
    expect(mockDebtRepository.remove).toHaveBeenCalledWith(debt);

    expect(result.finalBalance).toBe(10);
    expect(result.logs).toEqual(['Transferred 70 to Jane Doe']);
  });

  it('should pay off debt and deposit remaining amount', () => {
    const debt = new Debt("John Doe", "Jane Doe", 70);
    mockDebtRepository.findDebtsByDebtor.mockReturnValue([debt]);

    const result = depositMoney.execute("John Doe", 100);

    expect(debtorAccount.balance).toBe(40); // 100 - 70 + 10
    expect(mockAccountRepository.save).toHaveBeenCalledWith(debtorAccount);
    
    expect(creditorAccount.balance).toBe(120); // 50 + 70
    expect(mockAccountRepository.save).toHaveBeenCalledWith(creditorAccount);

    expect(debt.amount).toBe(0); // 70 - 70
    expect(mockDebtRepository.save).not.toHaveBeenCalled();
    expect(mockDebtRepository.remove).toHaveBeenCalledWith(debt);

    expect(result.finalBalance).toBe(40);
    expect(result.logs).toEqual(['Transferred 70 to Jane Doe']);
  });

  it('should break loop when remaining amount is 0', () => {
    const debt1 = new Debt("John Doe", "Jane Doe", 30);
    const debt2 = new Debt("John Doe", "James Doe", 50);
    mockDebtRepository.findDebtsByDebtor.mockReturnValue([debt1, debt2]);

    const result = depositMoney.execute("John Doe", 30);

    // Only the first debt is paid off, the second debt is not paid off because there is no money left
    expect(creditorAccount.balance).toBe(80); // 50 + 30
    expect(mockAccountRepository.save).toHaveBeenCalledWith(creditorAccount);
    expect(debt1.amount).toBe(0); // 30 - 30
    expect(mockDebtRepository.remove).toHaveBeenCalledWith(debt1);

    // The second debt is not paid off (remainingAmount = 0 after paying off the first debt)
    expect(thirdAccount.balance).toBe(0); // The balance is not changed
    expect(mockAccountRepository.save).not.toHaveBeenCalledWith(thirdAccount);
    expect(debt2.amount).toBe(50); // The debt is still there
    expect(mockDebtRepository.save).not.toHaveBeenCalled();
    expect(mockDebtRepository.remove).not.toHaveBeenCalledWith(debt2);

    expect(debtorAccount.balance).toBe(10); // No additional deposit because there is no money left
    expect(mockAccountRepository.save).not.toHaveBeenCalledWith(debtorAccount);
    expect(result.finalBalance).toBe(10);
    expect(result.logs).toEqual(['Transferred 30 to Jane Doe']);
  });

  it('should skip debt when creditor account is not found', () => {
    const debtToNonExistentCreditor = new Debt("John Doe", "NonExistent", 50);
    const debtToJane = new Debt("John Doe", "Jane Doe", 30);
    mockDebtRepository.findDebtsByDebtor.mockReturnValue([debtToNonExistentCreditor, debtToJane]);

    // Mock to return null for the non-existent creditor
    mockAccountRepository.findByName.mockImplementation((name) => {
      if (name === "John Doe") return debtorAccount;
      if (name === "Jane Doe") return creditorAccount;
      if (name === "NonExistent") return null; // The creditor does not exist
      return null;
    });

    const result = depositMoney.execute("John Doe", 100);

    // The first debt is skipped because the creditor does not exist
    expect(debtToNonExistentCreditor.amount).toBe(50); // The debt is not changed
    expect(mockDebtRepository.save).not.toHaveBeenCalledWith(debtToNonExistentCreditor);
    expect(mockDebtRepository.remove).not.toHaveBeenCalledWith(debtToNonExistentCreditor);

    // The second debt is paid off normally
    expect(creditorAccount.balance).toBe(80); // 50 + 30
    expect(mockAccountRepository.save).toHaveBeenCalledWith(creditorAccount);
    expect(debtToJane.amount).toBe(0); // 30 - 30
    expect(mockDebtRepository.remove).toHaveBeenCalledWith(debtToJane);

    // There is 70 left to deposit into the account
    expect(debtorAccount.balance).toBe(80); // 10 + 70
    expect(mockAccountRepository.save).toHaveBeenCalledWith(debtorAccount);
    expect(result.finalBalance).toBe(80);
    expect(result.logs).toEqual(['Transferred 30 to Jane Doe']); // Only the second debt is logged
  });

  /**
   * @description
   * Test scenario for paying off multiple debts:
   * - John Doe has two outstanding debts:
   *   1. Owes Jane Doe a specified amount.
   *   2. Owes James Doe a specified amount.
   * 
   * Account variables:
   * - debtorAccount: John Doe - The debtor
   * - creditorAccount: Jane Doe - The first creditor
   * - thirdAccount: James Doe - The second creditor
   */
  it('should pay off multiple debts', () => {
    const debtFromJohnToJane = new Debt("John Doe", "Jane Doe", 20); 
    const debtFromJohnToJames = new Debt("John Doe", "James Doe", 50);
    mockDebtRepository.findDebtsByDebtor.mockReturnValue([debtFromJohnToJane, debtFromJohnToJames]);

    const result = depositMoney.execute("John Doe", 100);

    // John Doe - The debtor
    expect(debtorAccount.balance).toBe(40); // 10 + 100 - 70
    expect(mockAccountRepository.save).toHaveBeenCalledWith(debtorAccount);
    
    // Jane Doe - The first creditor
    expect(creditorAccount.balance).toBe(70); // 50 + 20 (initial balance + amount paid)
    expect(mockAccountRepository.save).toHaveBeenCalledWith(creditorAccount);
    expect(mockDebtRepository.remove).toHaveBeenCalledWith(debtFromJohnToJane);

    // James Doe - The second creditor
    expect(thirdAccount.balance).toBe(50); // 0 + 50
    expect(mockAccountRepository.save).toHaveBeenCalledWith(thirdAccount);
    expect(mockDebtRepository.remove).toHaveBeenCalledWith(debtFromJohnToJames);

    expect(result.finalBalance).toBe(40);
    expect(result.logs).toEqual(['Transferred 20 to Jane Doe', 'Transferred 50 to James Doe']);
  });
});