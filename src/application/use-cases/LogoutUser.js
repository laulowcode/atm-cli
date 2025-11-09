export class LogoutUser {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
  }

  execute() {
    const currentUser = this.sessionManager.getCurrentUser();

    if (!currentUser) {
      throw new Error('No user is logged in');
    }

    this.sessionManager.logout();

    return {
      loggedOutUser: currentUser
    };
  }
}