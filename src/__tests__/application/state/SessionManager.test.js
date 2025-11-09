import { SessionManager } from '../../../application/state/SessionManager.js';

describe('SessionManager', () => {
  let sessionManager;

  beforeEach(() => {
    sessionManager = new SessionManager();
  });

  it('should login a user', () => {
    sessionManager.login('John Doe');
    expect(sessionManager.getCurrentUser()).toBe('John Doe');
  });

  it('should logout a user', () => {
    sessionManager.login('John Doe');
    sessionManager.logout();
    expect(sessionManager.getCurrentUser()).toBeNull();
  });

  it('should return true if a user is logged in', () => {
    sessionManager.login('John Doe');
    expect(sessionManager.isLoggedIn()).toBe(true);
  });

  it('should return false if a user is not logged in', () => {
    expect(sessionManager.isLoggedIn()).toBe(false);
  });
});