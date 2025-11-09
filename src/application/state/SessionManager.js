export class SessionManager {
  constructor() {
    this.currentUser = null;
  }

  login(name) {
    this.currentUser = name;
  }

  logout() {
    this.currentUser = null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }
}