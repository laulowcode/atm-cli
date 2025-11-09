import { Debt } from '../../../domain/entities/Debt.js';

describe('Debt', () => {
  describe('Constructor', () => {
    test('should create debt with debtor name, creditor name, and amount', () => {
      const debt = new Debt('Alice', 'Bob', 100);
      expect(debt.debtorName).toBe('Alice');
      expect(debt.creditorName).toBe('Bob');
      expect(debt.amount).toBe(100);
    });

    test('should throw error when amount is less than or equal to 0', () => {
      expect(() => new Debt('Alice', 'Bob', 0)).toThrow('Amount must be greater than 0');
      expect(() => new Debt('Alice', 'Bob', -100)).toThrow('Amount must be greater than 0');
    });
  });
});