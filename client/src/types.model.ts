import { ROLES } from "./constants/role.constant";

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface RoleItem {
  id: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
}
export interface CustomerList {
  id: string;
  company_id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}
export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role?: { id: string; name: string };
  companies?: Company[];
  createdAt?: string;
}

export interface User {
  id: string;
  sub?: string;
  name: string;
  email: string;
  role?: string;
  companies: Company[];
  permissions: string[];
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface UserData {
  id?: string;
  sub: string;
  name: string;
  email: string;
  role: Role;
}

export interface GlobalState {
  user: User | null;
  selectedCompany: Company | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface GlobalContextType {
  state: GlobalState;
  user: User | null;
  selectedCompany: Company | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  globalUserData: {
    user: User | null;
    selectedCompany: Company | null;
  };
  login: (token: string, user: User) => void;
  logout: () => void;
  selectCompany: (company: Company) => void;
  updateGlobalData: (
    newField: Partial<GlobalState> | { [key: string]: unknown },
  ) => void;
  refreshCurrentUser: () => Promise<void>;
}
