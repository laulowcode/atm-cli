import { jest } from '@jest/globals';
import { TransferMoney } from '../../../application/use-cases/TransferMoney.js';
import { Account } from '../../../domain/entities/Account.js';
import { Debt } from '../../../domain/entities/Debt.js';

const mockAccountRepository = {
  findByName: jest.fn(),
  save: jest.fn()
};

const mockDebtRepository = {
  findDebtBetween: jest.fn(),
  save: jest.fn(),
  remove: jest.fn()
};

describe('TransferMoney', () => {
  let transferMoney;
  let senderAccount;
  let receiverAccount;

  beforeEach(() => {
    mockAccountRepository.findByName.mockClear();
    mockAccountRepository.save.mockClear();
    mockDebtRepository.findDebtBetween.mockClear();
    mockDebtRepository.save.mockClear();
    mockDebtRepository.remove.mockClear();

    transferMoney = new TransferMoney(mockAccountRepository, mockDebtRepository);
    senderAccount = new Account("Alice", 100);
    receiverAccount = new Account("Bob", 50);

    mockAccountRepository.findByName.mockImplementation((name) => {
      if (name === "Alice") return senderAccount;
      if (name === "Bob") return receiverAccount;
      return null;
    });
  });

  it('should throw error if sender and receiver are the same', () => {
    expect(() => transferMoney.execute("Alice", "Alice", 50)).toThrow('Sender and receiver cannot be the same');
  });

  it('should throw error if amount is less than or equal to 0', () => {
    expect(() => transferMoney.execute("Alice", "Bob", 0)).toThrow('Amount must be greater than 0');
    expect(() => transferMoney.execute("Alice", "Bob", -100)).toThrow('Amount must be greater than 0');
  });

  it('should throw error if sender account is not found', () => {
    mockAccountRepository.findByName.mockReturnValue(null);
    expect(() => transferMoney.execute("James", "Bob", 50)).toThrow('Sender account not found');
  });

  it('should throw error if receiver account is not found', () => {
    expect(() => transferMoney.execute("Alice", "James", 50)).toThrow('Receiver account not found');
  });

  it('should transfer fully if sender has enough balance', () => {
    mockDebtRepository.findDebtBetween.mockReturnValue(null);
    const result = transferMoney.execute("Alice", "Bob", 50);
    expect(result.amount).toBe(50);
    expect(result.senderNewBalance).toBe(50);
    expect(result.cashTransferred).toBe(50);
    expect(result.debtReduced).toBe(0);
    expect(result.debtCreated).toBe(0);
    expect(result.receiverOwesBack).toBe(0);
    expect(mockAccountRepository.save).toHaveBeenCalledTimes(2);
    expect(mockAccountRepository.save).toHaveBeenCalledWith(senderAccount);
    expect(mockAccountRepository.save).toHaveBeenCalledWith(receiverAccount);

    // No debt should be created in this case
    expect(mockDebtRepository.save).not.toHaveBeenCalled();
  });

  it ('should create debt if balance is not enough (no existing debt)', () => {
    mockDebtRepository.findDebtBetween.mockReturnValue(null);
    const result = transferMoney.execute("Alice", "Bob", 150);
    expect(result.amount).toBe(150);
    expect(result.senderNewBalance).toBe(0);
    expect(result.cashTransferred).toBe(100);
    expect(result.debtReduced).toBe(0);
    expect(result.debtCreated).toBe(50);
    expect(result.receiverOwesBack).toBe(0);
    expect(mockAccountRepository.save).toHaveBeenCalledTimes(2);
    expect(mockAccountRepository.save).toHaveBeenCalledWith(expect.objectContaining({ name: "Alice", balance: 0 }));
    expect(mockAccountRepository.save).toHaveBeenCalledWith(expect.objectContaining({ name: "Bob", balance: 150 }));
    expect(mockDebtRepository.save).toHaveBeenCalledTimes(1);
    expect(mockDebtRepository.save).toHaveBeenCalledWith(expect.objectContaining({ debtorName: "Alice", creditorName: "Bob", amount: 50 }));
  });

  it('should update existing debt if balance is not enough (sender owes receiver)', () => {
    const existingDebt = new Debt("Alice", "Bob", 100);
    mockDebtRepository.findDebtBetween.mockImplementation((debtor, creditor) => {
      if (debtor === "Alice" && creditor === "Bob") return existingDebt;
      return null;
    });
    const result = transferMoney.execute("Alice", "Bob", 150);
    expect(result.amount).toBe(150);
    expect(result.senderNewBalance).toBe(0);
    expect(result.cashTransferred).toBe(100);
    expect(result.debtReduced).toBe(0);
    expect(result.debtCreated).toBe(50);
    expect(result.receiverOwesBack).toBe(0);
    expect(existingDebt.amount).toBe(150); // 100 + 50
    expect(mockAccountRepository.save).toHaveBeenCalledTimes(2);
    expect(mockAccountRepository.save).toHaveBeenCalledWith(expect.objectContaining({ name: "Alice", balance: 0 }));
    expect(mockAccountRepository.save).toHaveBeenCalledWith(expect.objectContaining({ name: "Bob", balance: 150 }));
  });

  it('should create debt when sender balance is 0', () => {
    senderAccount = new Account("Alice", 0);
    mockAccountRepository.findByName.mockImplementation((name) => {
      if (name === "Alice") return senderAccount;
      if (name === "Bob") return receiverAccount;
      return null;
    });
    mockDebtRepository.findDebtBetween.mockReturnValue(null);
    
    const result = transferMoney.execute("Alice", "Bob", 100);
    expect(result.amount).toBe(100);
    expect(result.senderNewBalance).toBe(0);
    expect(result.cashTransferred).toBe(0);
    expect(result.debtReduced).toBe(0);
    expect(result.debtCreated).toBe(100);
    expect(result.receiverOwesBack).toBe(0);
    expect(mockAccountRepository.save).not.toHaveBeenCalled();
    expect(mockDebtRepository.save).toHaveBeenCalledTimes(1);
    expect(mockDebtRepository.save).toHaveBeenCalledWith({ debtorName: "Alice", creditorName: "Bob", amount: 100, payments: [] });
  });

  it('should reduce receiver debt when receiver owes sender (partial debt)', () => {
    const receiverDebtToSender = new Debt("Bob", "Alice", 70);
    mockDebtRepository.findDebtBetween.mockImplementation((debtor, creditor) => {
      if (debtor === "Bob" && creditor === "Alice") return receiverDebtToSender;
      return null;
    });

    const result = transferMoney.execute("Alice", "Bob", 30);
    
    expect(result.amount).toBe(30);
    expect(result.senderNewBalance).toBe(100);
    expect(result.cashTransferred).toBe(0);
    expect(result.debtReduced).toBe(30);
    expect(result.debtCreated).toBe(0);
    expect(result.receiverOwesBack).toBe(40); // 70 - 30
    expect(receiverDebtToSender.amount).toBe(40);
    expect(mockDebtRepository.save).toHaveBeenCalledWith(receiverDebtToSender);
    expect(mockDebtRepository.remove).not.toHaveBeenCalled();
    expect(mockAccountRepository.save).not.toHaveBeenCalled();
  });

  it('should reduce receiver debt and transfer remaining cash', () => {
    const receiverDebtToSender = new Debt("Bob", "Alice", 30);
    mockDebtRepository.findDebtBetween.mockImplementation((debtor, creditor) => {
      if (debtor === "Bob" && creditor === "Alice") return receiverDebtToSender;
      return null;
    });

    const result = transferMoney.execute("Alice", "Bob", 50);
    
    expect(result.amount).toBe(50);
    expect(result.senderNewBalance).toBe(80); // 100 - 20 (only cash transferred)
    expect(result.cashTransferred).toBe(20); // 50 - 30
    expect(result.debtReduced).toBe(30);
    expect(result.debtCreated).toBe(0);
    expect(result.receiverOwesBack).toBe(0);
    expect(receiverDebtToSender.amount).toBe(0);
    expect(mockDebtRepository.remove).toHaveBeenCalledWith(receiverDebtToSender);
    expect(mockAccountRepository.save).toHaveBeenCalledWith(senderAccount);
    expect(mockAccountRepository.save).toHaveBeenCalledWith(receiverAccount); // Cash was transferred
    expect(receiverAccount.balance).toBe(70); // 50 + 20
  });

  it('should clear receiver debt fully when transfer amount equals debt', () => {
    const receiverDebtToSender = new Debt("Bob", "Alice", 50);
    mockDebtRepository.findDebtBetween.mockImplementation((debtor, creditor) => {
      if (debtor === "Bob" && creditor === "Alice") return receiverDebtToSender;
      return null;
    });

    const result = transferMoney.execute("Alice", "Bob", 50);
    
    expect(result.amount).toBe(50);
    expect(result.senderNewBalance).toBe(100); // No withdrawal!
    expect(result.cashTransferred).toBe(0);
    expect(result.debtReduced).toBe(50);
    expect(result.debtCreated).toBe(0);
    expect(result.receiverOwesBack).toBe(0);
    expect(receiverDebtToSender.amount).toBe(0);
    expect(mockDebtRepository.remove).toHaveBeenCalledWith(receiverDebtToSender);
    expect(mockAccountRepository.save).not.toHaveBeenCalled(); // No account changes!
  });
});