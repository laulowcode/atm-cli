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

  describe('makePayment', () => {
    test('should throw when payment amount is less than or equal to 0', () => {
      const debt = new Debt('Alice', 'Bob', 100);
      expect(() => debt.makePayment(0)).toThrow('Amount must be greater than 0');
      expect(() => debt.makePayment(-5)).toThrow('Amount must be greater than 0');
    });

    test('should throw when payment amount exceeds remaining debt', () => {
      const debt = new Debt('Alice', 'Bob', 100);
      expect(() => debt.makePayment(101)).toThrow(
        'Amount must be less than or equal to the debt amount',
      );
    });

    test('should deduct amount, record payment, and return payoff status', () => {
      const debt = new Debt('Alice', 'Bob', 100);
      const isPaidOff = debt.makePayment(40, new Date('2024-01-01'));

      expect(isPaidOff).toBe(false);
      expect(debt.amount).toBe(60);
      expect(debt.payments).toHaveLength(1);
      expect(debt.payments[0]).toMatchObject({ amount: 40 });

      const fullyPaid = debt.makePayment(60);
      expect(fullyPaid).toBe(true);
      expect(debt.amount).toBe(0);
    });
  });

  describe('increaseDebt', () => {
    test('should throw when increase amount is less than or equal to 0', () => {
      const debt = new Debt('Alice', 'Bob', 100);
      expect(() => debt.increaseDebt(0)).toThrow('Amount must be greater than 0');
      expect(() => debt.increaseDebt(-10)).toThrow('Amount must be greater than 0');
    });

    test('should increase debt amount when value is valid', () => {
      const debt = new Debt('Alice', 'Bob', 100);
      debt.increaseDebt(50);
      expect(debt.amount).toBe(150);
    });
  });
});