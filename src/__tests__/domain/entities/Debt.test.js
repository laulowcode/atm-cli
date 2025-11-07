import { Debt } from '../../../domain/entities/Debt.js';

describe('Debt', () => {
  describe('Constructor', () => {
    test('should create debt with debtor name, creditor name, and amount', () => {
      const debt = new Debt('John Doe', 'Jane Doe', 100);
      expect(debt.debtorName).toBe('John Doe');
      expect(debt.creditorName).toBe('Jane Doe');
      expect(debt.amount).toBe(100);
    });

    test('should throw error when amount is less than or equal to 0', () => {
      expect(() => new Debt('John Doe', 'Jane Doe', 0)).toThrow('Amount must be greater than 0');
      expect(() => new Debt('John Doe', 'Jane Doe', -100)).toThrow('Amount must be greater than 0');
    });
  });
});