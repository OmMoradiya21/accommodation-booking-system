
export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface Permission {
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

export interface Accommodation {
  id: string;
  name: string;
  description?: string;
  location: string;
  price_per_night: number;
  createdAt?: string;
  updatedAt?: string;
}

export type BookingStatus =
  | "Pending"
  | "Approved"
  | "Declined";

export interface Booking {
  id: string;
  company_id: string;
  customer_id: string;
  accommodation_id: string;
  check_in: string;
  check_out: string;
  status: BookingStatus;
  customer?: CustomerList;
  accommodation?: Accommodation;
  company?: Company;
  createdAt?: string;
  updatedAt?: string;
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
