import { InMemoryAccountRepository } from '../../../infrastructure/persistence/InMemoryAccountRepository.js';
import { Account } from '../../../domain/entities/Account.js';

describe('InMemoryAccountRepository', () => {
  let repo;

  beforeEach(() => {
    repo = new InMemoryAccountRepository();
  });

  it('should save and find an account', () => {
    const account = new Account('Alice', 100);
    repo.save(account);

    const found = repo.findByName('Alice');
    expect(found).toBe(account);
    expect(found.balance).toBe(100);
  });

  it('should return null if account is not found', () => {
    const found = repo.findByName('James');
    expect(found).toBeNull();
  });

  it('should update / overwrite an existing account', () => {
    const originalAccount = new Account('Bob', 100);
    repo.save(originalAccount);

    const updatedAccount = new Account('Bob', 200);
    repo.save(updatedAccount);

    const found = repo.findByName('Bob');
    expect(found).toBe(updatedAccount);
    expect(found.balance).toBe(200);
  })
});