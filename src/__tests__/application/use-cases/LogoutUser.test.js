import { jest } from '@jest/globals';
import { LogoutUser } from '../../../application/use-cases/LogoutUser.js';

const mockSession = {
  getCurrentUser: jest.fn(),
  logout: jest.fn()
}

describe('LogoutUser', () => {
  let logoutUser;

  beforeEach(() => {
    mockSession.getCurrentUser.mockClear();
    mockSession.logout.mockClear();
    logoutUser = new LogoutUser(mockSession);
  });

  it('should call session.logout and return the logged out user', () => {
    mockSession.getCurrentUser.mockReturnValue('Alice');
    const result = logoutUser.execute();
    expect(mockSession.getCurrentUser).toHaveBeenCalled();
    expect(mockSession.logout).toHaveBeenCalledTimes(1);
    expect(result.loggedOutUser).toBe('Alice');
  });

  it('should throw an error if no user is logged in', () => {
    mockSession.getCurrentUser.mockReturnValue(null);
    expect(() => logoutUser.execute()).toThrow('No user is logged in');
    expect(mockSession.logout).not.toHaveBeenCalled();
  });
});