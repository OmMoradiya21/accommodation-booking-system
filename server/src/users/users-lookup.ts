import { CreateUserDto } from './dto/create-user.dto.ts';
import { User } from './entities/user.entity.ts';

export const USERS_LOOKUP = Symbol('USERS_LOOKUP');
export interface UsersLookup {
  findByEmail(email: string): Promise<User | null>;

  create(createUserDto: CreateUserDto): Promise<User>;
}
