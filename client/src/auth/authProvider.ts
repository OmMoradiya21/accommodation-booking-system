import { AuthUser } from "../types.model";

export const authProvider = {
  async getUser(): Promise<AuthUser | null> {
    // TODO:
    // call /auth/me api to get user data and store it in local storage
    //
    const user = localStorage.getItem("auth_user");
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated(): boolean {
    return Boolean(this.getUser());
  },
};
