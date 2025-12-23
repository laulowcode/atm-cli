import { jest } from '@jest/globals';
import { DepositMoney } from '../../../application/use-cases/DepositMoney.js';
import { Account } from '../../../domain/entities/Account.js';
import { Debt } from '../../../domain/entities/Debt.js';
import { HighestAmountFirstStrategy } from '../../../application/strategies/debt-payment/HighestAmountFirstStrategy.js';

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

    debtorAccount = new Account("Alice", 10);
    creditorAccount = new Account("Bob", 50);
    thirdAccount = new Account("Charlie", 0);

    mockAccountRepository.findByName.mockImplementation((name) => {
      if (name === "Alice") return debtorAccount;
      if (name === "Bob") return creditorAccount;
      if (name === "Charlie") return thirdAccount;
      return null;
    });
  });

  it('should throw an error if the account is not found', () => {
    mockAccountRepository.findByName.mockReturnValue(null);
    expect(() => depositMoney.execute("James", 50)).toThrow('Account not found');
    expect(mockAccountRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error if amount is less than or equal to 0', () => {
    mockDebtRepository.findDebtsByDebtor.mockReturnValue([]);
    expect(() => depositMoney.execute("Alice", 0)).toThrow('Amount must be greater than 0');
    expect(() => depositMoney.execute("Alice", -100)).toThrow('Amount must be greater than 0');
    expect(() => depositMoney.execute("Alice", -50)).toThrow('Amount must be greater than 0');
    expect(mockAccountRepository.save).not.toHaveBeenCalled();
  });

  it('should deposit to balance if no debt is found', () => {
    mockDebtRepository.findDebtsByDebtor.mockReturnValue([]);
    
    const result = depositMoney.execute("Alice", 100);

    expect(debtorAccount.balance).toBe(110);
    expect(mockAccountRepository.save).toHaveBeenCalledWith(debtorAccount);
    expect(mockDebtRepository.save).not.toHaveBeenCalled();
    expect(mockDebtRepository.remove).not.toHaveBeenCalled();
    expect(result.balance).toBe(110);
    expect(result.logs).toEqual([]);
  });

  it('should pay off partial debt (debt amount is greater than deposit amount)', () => {
    const debt = new Debt("Alice", "Bob", 70);
    // Mock to return debts based on debtor name
    mockDebtRepository.findDebtsByDebtor.mockImplementation((debtorName) => {
      if (debtorName === "Alice") return [debt];
      if (debtorName === "Bob") return []; // Bob has no debts
      return [];
    });

    const result = depositMoney.execute("Alice", 30);

    expect(debtorAccount.balance).toBe(10);
    // 'save' should not be called for debtor account as the balance is not changed (30 < 70)
    expect(mockAccountRepository.save).not.toHaveBeenCalledWith(debtorAccount);
    
    expect(creditorAccount.balance).toBe(80); // 50 + 30
    expect(mockAccountRepository.save).toHaveBeenCalledWith(creditorAccount);

    expect(debt.amount).toBe(40); // 70 - 30
    expect(mockDebtRepository.save).toHaveBeenCalledWith(debt);
    expect(mockDebtRepository.remove).not.toHaveBeenCalled(); // Debt is not fully paid off yet

    expect(result.balance).toBe(10);
    expect(result.logs).toEqual(['Transferred $30 to Bob']);
  });

  it('should pay off full debt (debt amount is equal to deposit amount)', () => {
    const debt = new Debt("Alice", "Bob", 70);
    mockDebtRepository.findDebtsByDebtor.mockImplementation((debtorName) => {
      if (debtorName === "Alice") return [debt];
      if (debtorName === "Bob") return []; // Bob has no debts
      return [];
    });

    const result = depositMoney.execute("Alice", 70);

    expect(debtorAccount.balance).toBe(10);
    expect(mockAccountRepository.save).not.toHaveBeenCalledWith(debtorAccount);
    
    expect(creditorAccount.balance).toBe(120); // 50 + 70
    expect(mockAccountRepository.save).toHaveBeenCalledWith(creditorAccount);

    expect(debt.amount).toBe(0); // 70 - 70
    expect(mockDebtRepository.save).not.toHaveBeenCalled();
    expect(mockDebtRepository.remove).toHaveBeenCalledWith(debt);

    expect(result.balance).toBe(10);
    expect(result.logs).toEqual(['Transferred $70 to Bob']);
  });

  it('should pay off debt and deposit remaining amount', () => {
    const debt = new Debt("Alice", "Bob", 70);
    mockDebtRepository.findDebtsByDebtor.mockImplementation((debtorName) => {
      if (debtorName === "Alice") return [debt];
      if (debtorName === "Bob") return []; // Bob has no debts
      return [];
    });

    const result = depositMoney.execute("Alice", 100);

    expect(debtorAccount.balance).toBe(40); // 100 - 70 + 10
    expect(mockAccountRepository.save).toHaveBeenCalledWith(debtorAccount);
    
    expect(creditorAccount.balance).toBe(120); // 50 + 70
    expect(mockAccountRepository.save).toHaveBeenCalledWith(creditorAccount);

    expect(debt.amount).toBe(0); // 70 - 70
    expect(mockDebtRepository.save).not.toHaveBeenCalled();
    expect(mockDebtRepository.remove).toHaveBeenCalledWith(debt);

    expect(result.balance).toBe(40);
    expect(result.logs).toEqual(['Transferred $70 to Bob']);
  });

  it('should break loop when remaining amount is 0', () => {
    const debt1 = new Debt("Alice", "Bob", 30);
    const debt2 = new Debt("Alice", "Charlie", 50);
    mockDebtRepository.findDebtsByDebtor.mockImplementation((debtorName) => {
      if (debtorName === "Alice") return [debt1, debt2];
      if (debtorName === "Bob") return []; // Bob has no debts
      if (debtorName === "Charlie") return []; // Charlie has no debts
      return [];
    });

    const result = depositMoney.execute("Alice", 30);

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
    expect(result.balance).toBe(10);
    expect(result.logs).toEqual(['Transferred $30 to Bob']);
  });

  it('should skip debt when creditor account is not found', () => {
    const debtToNonExistentCreditor = new Debt("Alice", "NonExistent", 50);
    const debtToJane = new Debt("Alice", "Bob", 30);
    mockDebtRepository.findDebtsByDebtor.mockImplementation((debtorName) => {
      if (debtorName === "Alice") return [debtToNonExistentCreditor, debtToJane];
      if (debtorName === "Bob") return []; // Bob has no debts
      return [];
    });

    // Mock to return null for the non-existent creditor
    mockAccountRepository.findByName.mockImplementation((name) => {
      if (name === "Alice") return debtorAccount;
      if (name === "Bob") return creditorAccount;
      if (name === "NonExistent") return null; // The creditor does not exist
      return null;
    });

    const result = depositMoney.execute("Alice", 100);

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
    expect(result.balance).toBe(80);
    expect(result.logs).toEqual(['Transferred $30 to Bob']); // Only the second debt is logged
  });

  /**
   * @description
   * Test scenario for paying off multiple debts:
   * - Alice has two outstanding debts:
   *   1. Owes Bob a specified amount.
   *   2. Owes Charlie a specified amount.
   * 
   * Account variables:
   * - debtorAccount: Alice - The debtor
   * - creditorAccount: Bob - The first creditor
   * - thirdAccount: Charlie - The second creditor
   */
  it('should pay off multiple debts', () => {
    const debtFromJohnToJane = new Debt("Alice", "Bob", 20); 
    const debtFromJohnToJames = new Debt("Alice", "Charlie", 50);
    mockDebtRepository.findDebtsByDebtor.mockImplementation((debtorName) => {
      if (debtorName === "Alice") return [debtFromJohnToJane, debtFromJohnToJames];
      if (debtorName === "Bob") return []; // Bob has no debts
      if (debtorName === "Charlie") return []; // Charlie has no debts
      return [];
    });

    const result = depositMoney.execute("Alice", 100);

    // Alice - The debtor
    expect(debtorAccount.balance).toBe(40); // 10 + 100 - 70
    expect(mockAccountRepository.save).toHaveBeenCalledWith(debtorAccount);
    
    // Bob - The first creditor
    expect(creditorAccount.balance).toBe(70); // 50 + 20 (initial balance + amount paid)
    expect(mockAccountRepository.save).toHaveBeenCalledWith(creditorAccount);
    expect(mockDebtRepository.remove).toHaveBeenCalledWith(debtFromJohnToJane);

    // Charlie - The second creditor
    expect(thirdAccount.balance).toBe(50); // 0 + 50
    expect(mockAccountRepository.save).toHaveBeenCalledWith(thirdAccount);
    expect(mockDebtRepository.remove).toHaveBeenCalledWith(debtFromJohnToJames);

    expect(result.balance).toBe(40);
    expect(result.logs).toEqual(['Transferred $20 to Bob', 'Transferred $50 to Charlie']);
  });

  it('should chain payment when creditor also has debts', () => {
    // Alice owes Bob $30; Bob owes Charlie $30. Alice deposits $40.
    const debtAliceToBob = new Debt("Alice", "Bob", 30);
    const debtBobToCharlie = new Debt("Bob", "Charlie", 30);

    mockDebtRepository.findDebtsByDebtor.mockImplementation((debtorName) => {
      if (debtorName === "Alice") return [debtAliceToBob];
      if (debtorName === "Bob") return [debtBobToCharlie];
      if (debtorName === "Charlie") return [];
      return [];
    });

    debtorAccount = new Account("Alice", 0);
    creditorAccount = new Account("Bob", 0);
    thirdAccount = new Account("Charlie", 0);

    mockAccountRepository.findByName.mockImplementation((name) => {
      if (name === "Alice") return debtorAccount;
      if (name === "Bob") return creditorAccount;
      if (name === "Charlie") return thirdAccount;
      return null;
    });

    const result = depositMoney.execute("Alice", 40);

    expect(debtorAccount.balance).toBe(10);
    expect(mockAccountRepository.save).toHaveBeenCalledWith(debtorAccount);

    expect(creditorAccount.balance).toBe(0);
    expect(thirdAccount.balance).toBe(30);
    expect(mockAccountRepository.save).toHaveBeenCalledWith(thirdAccount);

    expect(debtAliceToBob.amount).toBe(0);
    expect(mockDebtRepository.remove).toHaveBeenCalledWith(debtAliceToBob);
    expect(debtBobToCharlie.amount).toBe(0);
    expect(mockDebtRepository.remove).toHaveBeenCalledWith(debtBobToCharlie);

    expect(result.balance).toBe(10);
    expect(result.logs).toEqual([
      'Transferred $30 to Bob',
      'Transferred $30 to Charlie'
    ]);
  });

  it('should throw error if account becomes null after chaining payment', () => {
    // Simulates missing account after chaining
    const debt = new Debt("Alice", "Bob", 30);

    mockDebtRepository.findDebtsByDebtor.mockImplementation((debtorName) => {
      if (debtorName === "Alice") return [debt];
      if (debtorName === "Bob") return [];
      return [];
    });

    let callCount = 0;
    mockAccountRepository.findByName.mockImplementation((name) => {
      callCount++;
      if (name === "Alice") {
        if (callCount === 1) return debtorAccount;
        return null;
      }
      if (name === "Bob") return creditorAccount;
      return null;
    });

    expect(() => depositMoney.execute("Alice", 30)).toThrow('Account not found');
  });

  it('should return 0 when user already visited (circular debt protection)', () => {
    // Chain: Alice → Bob → Charlie → Alice (circular). Each owes $30. Alice deposits $10.
    const debtAliceToBob = new Debt("Alice", "Bob", 30);
    const debtBobToCharlie = new Debt("Bob", "Charlie", 30);
    const debtCharlieToAlice = new Debt("Charlie", "Alice", 30);

    mockDebtRepository.findDebtsByDebtor.mockImplementation((debtorName) => {
      if (debtorName === "Alice") return [debtAliceToBob];
      if (debtorName === "Bob") return [debtBobToCharlie];
      if (debtorName === "Charlie") return [debtCharlieToAlice];
      return [];
    });

    debtorAccount = new Account("Alice", 0);
    creditorAccount = new Account("Bob", 0);
    thirdAccount = new Account("Charlie", 0);

    mockAccountRepository.findByName.mockImplementation((name) => {
      if (name === "Alice") return debtorAccount;
      if (name === "Bob") return creditorAccount;
      if (name === "Charlie") return thirdAccount;
      return null;
    });

    const result = depositMoney.execute("Alice", 10);

    // Each debt is reduced, but no one receives new balance due to circular protection
    expect(debtAliceToBob.amount).toBe(20);
    expect(debtBobToCharlie.amount).toBe(20);
    expect(debtCharlieToAlice.amount).toBe(20);

    expect(debtorAccount.balance).toBe(0);
    expect(creditorAccount.balance).toBe(0);
    expect(thirdAccount.balance).toBe(0);

    expect(result.logs).toEqual([
      'Transferred $10 to Bob',
      'Transferred $10 to Charlie',
      'Transferred $10 to Alice'
    ]);
  });

  it('should handle 2-person circular debt', () => {
    // Alice owes Bob $50, Bob owes Alice $50
    const debtAliceToBob = new Debt("Alice", "Bob", 50);
    const debtBobToAlice = new Debt("Bob", "Alice", 50);

    mockDebtRepository.findDebtsByDebtor.mockImplementation((name) => {
      if (name === "Alice") return [debtAliceToBob];
      if (name === "Bob") return [debtBobToAlice];
      return [];
    });

    debtorAccount = new Account("Alice", 0);
    creditorAccount = new Account("Bob", 0);

    mockAccountRepository.findByName.mockImplementation((name) => {
      if (name === "Alice") return debtorAccount;
      if (name === "Bob") return creditorAccount;
      return null;
    });

    const result = depositMoney.execute("Alice", 30);

    expect(debtAliceToBob.amount).toBe(20);
    expect(debtBobToAlice.amount).toBe(20);
    expect(result.balance).toBe(0);
  });

  it('should allow configuring debt payment strategy', () => {
    const highestFirstStrategy = new HighestAmountFirstStrategy();
    depositMoney = new DepositMoney(mockAccountRepository, mockDebtRepository, highestFirstStrategy);

    const smallDebt = new Debt("Alice", "Bob", 10);
    const largeDebt = new Debt("Alice", "Charlie", 90);

    mockDebtRepository.findDebtsByDebtor.mockReturnValue([smallDebt, largeDebt]);

    const bobAccount = new Account("Bob", 0);
    const charlieAccount = new Account("Charlie", 0);

    mockAccountRepository.findByName.mockImplementation((name) => {
      if (name === "Alice") return debtorAccount;
      if (name === "Bob") return bobAccount;
      if (name === "Charlie") return charlieAccount;
      return null;
    });

    depositMoney.execute("Alice", 50);

    expect(largeDebt.amount).toBe(40);
    expect(smallDebt.amount).toBe(10);
  });
});