import { ROLES } from "./constants/role.constant";

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
}