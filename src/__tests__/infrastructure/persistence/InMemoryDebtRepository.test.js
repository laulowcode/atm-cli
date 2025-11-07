import { InMemoryDebtRepository } from '../../../infrastructure/persistence/InMemoryDebtRepository.js';
import { Debt } from '../../../domain/entities/Debt.js';

describe('InMemoryDebtRepository', () => {
  let repo;

  beforeEach(() => {
    repo = new InMemoryDebtRepository();
    repo.constructor.debts = [];
  });

  it('should save a new debt', () => {
    const debt = new Debt('John Doe', 'Jane Doe', 100);
    repo.save(debt);

    const found = repo.findDebtBetween('John Doe', 'Jane Doe');
    expect(found).toBe(debt);
    expect(found.amount).toBe(100);
  });

  it('should update an existing debt amount', () => {
    const debt = new Debt('John Doe', 'Jane Doe', 100);
    repo.save(debt);
  
    const updatedDebt = new Debt('John Doe', 'Jane Doe', 200);
    repo.save(updatedDebt);
  
    const found = repo.findDebtBetween('John Doe', 'Jane Doe');
    expect(found).toBe(debt);
    expect(found.amount).toBe(300);
  
    const allDebts = repo.findDebtsByDebtor('John Doe');
    expect(allDebts.length).toBe(1);
  });

  it('should find debts by debtor name', () => {
    const debt1 = new Debt('John Doe', 'Jane Doe', 100);
    const debt2 = new Debt('John Doe', 'James Doe', 200);
    const debt3 = new Debt('Jane Doe', 'John Doe', 50);

    repo.save(debt1);
    repo.save(debt2);
    repo.save(debt3);

    const johnDoeDebts = repo.findDebtsByDebtor('John Doe');
    expect(johnDoeDebts.length).toBe(2);
    expect(johnDoeDebts.map(debt => debt.creditorName)).toEqual(['Jane Doe', 'James Doe']);
  });

  it('should find debts by creditor name', () => {
    const debt1 = new Debt('John Doe', 'Jane Doe', 100);
    const debt2 = new Debt('James Doe', 'Jane Doe', 70);

    repo.save(debt1);
    repo.save(debt2);

    const janeDoeCredits = repo.findDebtsByCreditor('Jane Doe');
    expect(janeDoeCredits.length).toBe(2);
    expect(janeDoeCredits.map(debt => debt.debtorName)).toEqual(['John Doe', 'James Doe']);
  });

  it('should remove a debt', () => {
    const debt = new Debt('John Doe', 'Jane Doe', 100);
    repo.save(debt);

    const found = repo.findDebtBetween('John Doe', 'Jane Doe');
    expect(found).not.toBeUndefined();

    repo.remove(debt);

    const foundAfterRemove = repo.findDebtBetween('John Doe', 'Jane Doe');
    expect(foundAfterRemove).toBeUndefined();
  });
});