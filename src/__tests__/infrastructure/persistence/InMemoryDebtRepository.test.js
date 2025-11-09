import { InMemoryDebtRepository } from '../../../infrastructure/persistence/InMemoryDebtRepository.js';
import { Debt } from '../../../domain/entities/Debt.js';

describe('InMemoryDebtRepository', () => {
  let repo;

  beforeEach(() => {
    repo = new InMemoryDebtRepository();
    repo.constructor.debts = [];
  });

  it('should save a new debt', () => {
    const debt = new Debt('Alice', 'Bob', 100);
    repo.save(debt);

    const found = repo.findDebtBetween('Alice', 'Bob');
    expect(found).toBe(debt);
    expect(found.amount).toBe(100);
  });

  it('should update an existing debt amount', () => {
    const debt = new Debt('Alice', 'Bob', 100);
    repo.save(debt);
  
    const updatedDebt = new Debt('Alice', 'Bob', 200);
    repo.save(updatedDebt);
  
    const found = repo.findDebtBetween('Alice', 'Bob');
    expect(found).toBe(debt);
    expect(found.amount).toBe(300);
  
    const allDebts = repo.findDebtsByDebtor('Alice');
    expect(allDebts.length).toBe(1);
  });

  it('should find debts by debtor name', () => {
    const debt1 = new Debt('Alice', 'Bob', 100);
    const debt2 = new Debt('Alice', 'Charlie', 200);
    const debt3 = new Debt('Bob', 'Alice', 50);

    repo.save(debt1);
    repo.save(debt2);
    repo.save(debt3);

    const johnDoeDebts = repo.findDebtsByDebtor('Alice');
    expect(johnDoeDebts.length).toBe(2);
    expect(johnDoeDebts.map(debt => debt.creditorName)).toEqual(['Bob', 'Charlie']);
  });

  it('should find debts by creditor name', () => {
    const debt1 = new Debt('Alice', 'Bob', 100);
    const debt2 = new Debt('Charlie', 'Bob', 70);

    repo.save(debt1);
    repo.save(debt2);

    const janeDoeCredits = repo.findDebtsByCreditor('Bob');
    expect(janeDoeCredits.length).toBe(2);
    expect(janeDoeCredits.map(debt => debt.debtorName)).toEqual(['Alice', 'Charlie']);
  });

  it('should remove a debt', () => {
    const debt = new Debt('Alice', 'Bob', 100);
    repo.save(debt);

    const found = repo.findDebtBetween('Alice', 'Bob');
    expect(found).not.toBeUndefined();

    repo.remove(debt);

    const foundAfterRemove = repo.findDebtBetween('Alice', 'Bob');
    expect(foundAfterRemove).toBeUndefined();
  });

  it('should handle removing debt when index is -1', () => {
    const debt = new Debt('Alice', 'Bob', 100);
    
    const wrongDebt = new Debt('Wrong', 'Wrong', 100);
    repo.remove(wrongDebt);

    repo.save(debt);
    repo.remove(wrongDebt);
    
    const found = repo.findDebtBetween('Alice', 'Bob');
    expect(found).toBe(debt);
  });
});