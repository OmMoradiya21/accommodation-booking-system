import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.ts';
import { UpdateUserDto } from './dto/update-user.dto.ts';
import { UserRepository } from './users.repository.ts';
import { ROLES_LOOKUP, type RolesLookup } from '../roles/roles-lookup.ts';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(ROLES_LOOKUP) private readonly rolesLookup: RolesLookup,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email already exist.');
    }

    let roleId = createUserDto.role_id;

    if (!roleId) {
      const userRoleId = await this.rolesLookup.findRoleIdByName('USER');
      roleId = userRoleId;
    }
    const savedUser = await this.userRepository.saveUser({
      ...createUserDto,
      role_id: roleId,
    });

    return savedUser;
  }

  async findAll() {
    return this.userRepository.findAll();
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userRepository.update(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException('User Not Found to update.');
    }
    return this.userRepository.saveUser(updatedUser);
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne(id);
    if (user) {
      await this.userRepository.remove(user);
      return { message: `User Removed Successfully` };
    } else {
      throw new NotFoundException('User not found to remove.');
    }
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }
}
