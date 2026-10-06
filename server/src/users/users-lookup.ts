import { User } from "./entities/user.entity.ts";

export const USER_LOOKUP = Symbol('USER_LOOKUP');
export interface UsersLookup {
  findByEmail(email: string): Promise<User | null>;
}
