import { Account } from '../../../domain/entities/Account.js';

describe('Account', () => {
  describe('Constructor', () => {
    test('should create account with name and initial balance', () => {
      const account = new Account('Alice', 100);
      expect(account.name).toBe('Alice');
      expect(account.balance).toBe(100);
    });

    test('should create account with default balance of 0', () => {
      const account = new Account('Bob');
      expect(account.name).toBe('Bob');
      expect(account.balance).toBe(0);
    });
  });

  describe('deposit', () => {
    test('should increase balance when depositing positive amount', () => {
      const account = new Account('Alice', 100);
      account.deposit(50);
      expect(account.balance).toBe(150);
    });

    test('should throw error when depositing negative amount', () => {
      const account = new Account('Alice', 100);
      expect(() => account.deposit(-50)).toThrow('Amount must be greater than 0');
    });
  });

  describe('withdraw', () => {
    test('should decrease balance when withdrawing valid amount', () => {
      const account = new Account('Alice', 100);
      const result = account.withdraw(50);
      expect(result).toBe(true);
      expect(account.balance).toBe(50);
    });

    test('should throw error when withdrawing negative amount', () => {
        const account = new Account('Alice', 100);
        expect(() => account.withdraw(-50)).toThrow('Amount must be greater than 0');
      });  

    test('should return false when withdrawing more than balance', () => {
      const account = new Account('Alice', 100);
      const result = account.withdraw(150);
      expect(result).toBe(false);
      expect(account.balance).toBe(100); // balance should remain unchanged
    });
  });
});

