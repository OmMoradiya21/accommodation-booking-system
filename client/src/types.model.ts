import { ROLES } from "./constants/role.constant";

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface UserData {
  sub: string;
  name: string;
  email:string;
  role: Role;
}